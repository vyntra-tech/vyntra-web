import aboutVideo from '../assets/about-vedeio.mp4'

export interface AboutStat {
  value: string
  label: string
}

export interface AboutVideoConfig {
  /**
   * Path or URL to the company introduction video (e.g., '/videos/intro.mp4').
   * If left empty, a clean dark placeholder with VYNTRA branding is displayed.
   */
  src: string
  /**
   * Optional custom poster image path.
   */
  poster?: string
  /**
   * Video card caption.
   */
  caption: string
}

export const aboutContent = {
  label: 'ABOUT VYNTRA',
  heading: 'We Build Digital Products That Matter.',
  description:
    'VYNTRA Technologies helps startups and enterprises build modern web applications, scalable cloud solutions, and AI-powered software through thoughtful design and reliable engineering.',
  stats: [
    { value: '20+', label: 'Projects Delivered' },
    { value: '15+', label: 'Startup Clients' },
    { value: '2026', label: 'Founded' },
  ] as AboutStat[],
  ctaText: "Let's Talk",
  ctaHref: '#contact',
  video: {
    src: aboutVideo, // Video asset configured to play in loop
    poster: '',
    caption: 'Meet VYNTRA',
  } as AboutVideoConfig,
}
