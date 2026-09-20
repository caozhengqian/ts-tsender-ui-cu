import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Tester@1234'

// MetaMask 启动后会去连 Ethereum Mainnet 的 Infura RPC，当前网络环境不可达，
// 于是弹出全屏 .loading-overlay（“Connecting to Ethereum Mainnet”）以及
// “We can't connect…” 通知 popover，两者都会拦截指针事件，导致 importWallet
// 的第一步点击就超时卡死。
//
// 这里通过 addInitScript 注入 CSS 把这些遮罩层隐藏掉。注意：
// 1. 必须用 context.addInitScript（页面加载早期注入）。addStyleTag/evaluate 会在
//    MetaMask 开启 LavaMoat（scuttling mode）后被拦截，报 “Map is inaccessible”。
// 2. addInitScript 只对“之后的导航”生效，所以注册后要 reload 一次页面让它真正
//    注入到当前页面。
// 3. 不要用 DOM 移除（element.remove()），那会让 MetaMask 的 React 崩溃。
// 4. 这个函数必须定义在 defineWalletSetup 回调之外：Synpress 用一个正则提取回调体，
//    回调里出现过深的嵌套箭头函数会触发该正则的灾难性回溯，卡死编译。
function injectOverlayHidingCss() {
    const css = [
        '.loading-overlay',
        '.loading-screen',
        '.loading-logo',
        '.loading-spinner',
        '.popover-bg',
        '#popover-content'
    ].join(', ') + ' { display: none !important; }'

    const inject = () => {
        const style = document.createElement('style')
        style.textContent = css
        ;(document.head || document.documentElement).appendChild(style)
    }
    if (document.head) inject()
    else document.addEventListener('DOMContentLoaded', inject)
}

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
    await context.addInitScript(injectOverlayHidingCss)
    // 让上面的 CSS 真正注入到当前已加载的页面
    await walletPage.reload()

    const metamask = new MetaMask(context, walletPage, PASSWORD)

    await metamask.importWallet(SEED_PHRASE)

    // 导入后把钱包切到本地 Anvil 网络，避免停留在 Mainnet（addNetwork 完成后会自动
    // 切换到新网络）。执行前需要先启动 anvil（`npm run anvil`）。
    await metamask.addNetwork({
        name: 'Anvil',
        rpcUrl: 'http://127.0.0.1:8545',
        chainId: 31337,
        symbol: 'ETH',
    })
})
