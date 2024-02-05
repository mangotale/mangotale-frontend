import Link from 'next/link';
import Image from 'next/image';
import planetIcon from '../../../public/YellowPlanetIcon.png';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function MakeRoomButton({ isLogin }: { isLogin: boolean }) {
  return (
    <Link href={isLogin ? '/newroom' : '/login'}>
      <button
        type='button'
        className='relative z-0 bg-white hover:bg-gray-100 rounded-[4rem] w-auto h-32 ml-20 my-10 shadow group'
      >
        <div className='flex items-center ml-20 mr-8'>
          <p className='text-4xl text-highlight font-extrabold'>
            {isLogin ? '동화 속으로 떠나기' : '로그인하고 떠나자!'}
          </p>
          <PlayIcon className='fill-main size-6 ml-2' />
        </div>
        <div className='absolute bottom-3 left-[-4.5rem] group-hover:animate-bounce'>
          <Image src={planetIcon} width={90} height={90} alt='방 생성 버튼' />
        </div>
      </button>
    </Link>
  );
}
