/**
 * Centralized animation variants for Framer Motion
 * Provides consistent animation patterns across the application
 */

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

export const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const slideDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

export const slideLeft = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export const slideRight = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

export const scaleUp = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
};

/**
 * Container variant for staggered children animations
 */
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerContainerFast = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

export const staggerContainerSlow = {
    animate: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

/**
 * Spring animation configs
 */
export const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
};

export const springConfigSlow = {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
};

export const springConfigBouncy = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
};

/**
 * Transition configs
 */
export const transitionFast = {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
};

export const transitionNormal = {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
};

export const transitionSlow = {
    duration: 0.35,
    ease: [0.4, 0, 0.2, 1],
};
