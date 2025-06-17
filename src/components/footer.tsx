import Image from 'next/image';
import logoLight from '../../public/logoipsum-light.svg';

export default function Footer(){
    return(
        <footer className='bg-[#2563EBDB]/[86%] flex flex-col md:flex-row gap-2 items-center justify-center w-full py-8'>
            <Image
                src={logoLight}
                alt='lorem loght'
                />
            <p className='text-white'>&copy; {new Date().getFullYear()} Blog genzet. All rights reserved.</p>
        </footer>
    )
}