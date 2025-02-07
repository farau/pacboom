"use client"; // Indique que ce composant est client-side

import { useEffect } from "react";

const BootstrapLoader = () => {
    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    return null; // Ce composant ne rend rien, il sert juste à charger Bootstrap JS
};

export default BootstrapLoader;
