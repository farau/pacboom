particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 100, // Nombre d'étoiles
        "density": {
          "enable": true,
          "value_area": 400 // Densité de l'espace où les étoiles sont générées
        }
      },
      "color": {
        "value": "#8c2b2b"
      },
      "shape": {
        "type": "star", // Type de forme des étoiles
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 5 // Nombre de côtés pour les étoiles
        }
      },
      "opacity": {
        "value": 0.5, // Opacité des étoiles
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1, // Vitesse de l'animation d'opacité
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 2, // Taille des étoiles
        "random": true,
        "anim": {
          "enable": false,
          "speed": 40,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": false, // Lier les étoiles entre elles
        "distance": 150,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 1, // Vitesse de déplacement des étoiles
        "direction": "top",
        "random": false,
        "straight": true,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false, // Réactions au survol de la souris
          "mode": "repulse"
        },
        "onclick": {
          "enable": false, // Réactions au clic
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 400,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 400,
          "size": 40,
          "duration": 2,
          "opacity": 8,
          "speed": 3
        },
        "repulse": {
          "distance": 200,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  });
  