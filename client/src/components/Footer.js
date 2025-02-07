import "@fortawesome/fontawesome-free/css/all.min.css";

const Footer = () => {
    return (
        <footer className="bg-black text-white text-center p-4 mt-10">
            <p>&copy; 2025 PacBoom | Logo by <a href="https://x.com/rodinh03" className="text-blue-400">Rodinho</a></p>
            <div className="flex justify-center space-x-4 mt-2">
                <a href="https://t.me/+wPZIcMLFQxBkNWRk" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-telegram text-white text-4xl"></i>
                </a>
                <a href="https://discord.gg/cXBe9u7vmD" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-discord text-white text-4xl"></i>
                </a>
                <a href="https://x.com/pacboom_" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter text-white text-4xl"></i>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
