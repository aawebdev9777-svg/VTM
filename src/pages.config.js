import Admin from './pages/Admin';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import Social from './pages/Social';
import AIAssistant from './pages/AIAssistant';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Home": Home,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Transactions": Transactions,
    "Wallet": Wallet,
    "Leaderboard": Leaderboard,
    "Social": Social,
    "AIAssistant": AIAssistant,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};