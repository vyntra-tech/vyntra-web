import type { TeamMember } from '../types'
import chandrabhanImg from '../assets/chandrabhan.jpg'
import shubhamImg from '../assets/shubham.jpg'
import sanjuImg from '../assets/sanju.jpg'
import nikhilImg from '../assets/nikhil.jpg'
import dharamImg from '../assets/dharam.png'

export const team: TeamMember[] = [
  {
    id: 'chandrabhan-gadeshwar',
    name: 'Chandrabhan Gadeshwar',
    role: 'Founder & CEO',
    initials: 'CG',
    image: chandrabhanImg,
    imagePosition: 'center 20%',
    specialty: 'Executive Leadership & Cloud Architecture',
    linkedin: 'https://www.linkedin.com/in/chandu7a7/',
    size: 'large',
  },
   {
    id: 'shubham-uprade',
    name: 'Shubham Uprade',
    role: 'Co-Founder & CTO',
    initials: 'SU',
    image: shubhamImg,
    imagePosition: 'center 12%',
    specialty: 'Technology Strategy, Engineering & Systems Architecture',
    linkedin: 'https://www.linkedin.com/in/shubham-uprade-092542278/',
    size: 'medium',
  },
  {
    id: 'sanjay-sende',
    name: 'Sanjay Sende',
    role: 'Full Stack Developer',
    initials: 'SS',
    image: sanjuImg,
    imagePosition: 'center 20%',
    specialty: 'Digital Products & SaaS Development',
    linkedin: 'https://www.linkedin.com/in/sanjay-sende-20a3b3278/',
    size: 'small',
  },
 
  {
    id: 'nikhil-waghade',
    name: 'Nikhil Waghade',
    role: 'Backend Systems Engineer',
    initials: 'NW',
    image: nikhilImg,
    imagePosition: 'center 15%',
    specialty: 'Backend Services & Database Architecture',
    linkedin: 'https://www.linkedin.com/in/nikhil-waghade',
    size: 'medium',
  },
  {
    id: 'dharamchand-patle',
    name: 'Dharamchand Patle',
    role: 'AI Solutions Engineer',
    initials: 'DP',
    image: dharamImg,
    imagePosition: 'center 18%',
    specialty: 'AI Solutions & Full Stack Systems',
    linkedin: 'https://www.linkedin.com/in/dharamchand-patle',
    size: 'medium',
  },
]
