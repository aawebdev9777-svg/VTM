import Admin from './pages/Admin';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Home": Home,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Transactions": Transactions,
    "Wallet": Wallet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};