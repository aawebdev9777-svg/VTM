import Admin from './pages/Admin';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Sheet from './pages/Sheet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Transactions": Transactions,
    "Wallet": Wallet,
    "Sheet": Sheet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};