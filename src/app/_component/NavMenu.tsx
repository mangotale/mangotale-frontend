import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import appLogo from '../../../public/AppMainLogo.png'

type Props = {
  isLogin: boolean
}

// TODO : isLogin property를 nextAuth 적용시 삭제
export default function NavMenu({ isLogin }: Props) {
  isLogin = false
  return (
    <header>
      <nav className='flex justify-center bg-white px-12 py-4 shadow'>
        <div className='grow flex flex-wrap justify-between items-center lg:mx-52 max-w-screen-2xl'>
          <Link href='/'>
            <Image src={appLogo} width={160} height={26} alt='' />
          </Link>
          <div className='lg:order-2'>
            <Link href='/login'>
              <button
                type='button'
                className='text-white font-semibold text-xl text-center bg-main hover:bg-maindark rounded-[2rem] px-6 py-2.5'
              >
                {isLogin ? '로그아웃' : '회원가입'}
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
