import Admin from './pages/Admin';
import Home from './pages/Home';
import Impersonate from './pages/Impersonate';
import Leaderboard from './pages/Leaderboard';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Sheet from './pages/Sheet';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Home": Home,
    "Impersonate": Impersonate,
    "Leaderboard": Leaderboard,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Sheet": Sheet,
    "Transactions": Transactions,
    "Wallet": Wallet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};