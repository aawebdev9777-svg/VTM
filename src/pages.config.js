import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Layout from './Layout';

export const PAGES = {
    "Home": Home,
    "Portfolio": Portfolio,
    "Leaderboard": Leaderboard,
    "Profile": Profile,
    "Wallet": Wallet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};