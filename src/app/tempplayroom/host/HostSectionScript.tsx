'use client';
import Image from 'next/image';
import CookieHouse from '@/../public/CookieHouse.png';
import style from '../_component/scrollbar.module.css';
import { useState, useRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios'




type Props = {
  client: any;
  roomId: string;
};


export default function HostSectionScript(props: Props) {
  const [scripts, setScripts] = useState<string[]>([
    '헨젤과 그레텔',
    '아기 돼지 삼형제',
    '신데렐라',
    '대본 이름',
    '대본 이름',
  ])



  useEffect(
    () => {
      axios.get(
        'https://mangotail.shop/api/v1/script/list',
      ).then((res) => {
        console.log(res.data.data)
        setScripts(res.data.data.scripts.map((element) => {return element.title}))
      }) .catch ((e) => {console.log(e)})
    },
    []
  )

  function onclickStart(idx : number) {
    const message = {
      code: 600,
      script : idx + 1
    };
    props.client.publish({
      destination: `/sub/channel/${props.roomId}`,
      body: JSON.stringify(message),
    });
  }


  return (
    <div className='bg-white shadow w-[24rem] h-[20rem] mr-6 mb-4 px-4'>
      <div className='flex items-center px-4 py-4'>
        <Image
          src={CookieHouse}
          width={28}
          height={30}
          alt='연극 대본 고르기'
        />
        <p className='text-3xl font-medium ml-3'>연극 대본 고르기</p>
      </div>
      <div className='overflow-auto h-[14rem]' id={style.scroll}>
        {scripts.map((value, key) => {
          return (
            <div key={key} className='bg-gray-200 rounded-xl w-[20rem] mb-2' onClick={() => { onclickStart(key) }}>
              <p className='text-xl p-3'>{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
