import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Transactions": Transactions,
    "Wallet": Wallet,
    "Portfolio": Portfolio,
    "Admin": Admin,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};