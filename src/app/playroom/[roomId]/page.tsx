'use client';
import style from '@/app/_component/modal.module.css'
import Link from "next/link"
import Top from './_component/Top'
// import { useRouter } from 'next/router'
import axios from 'axios';
import BottomHost from './_component/host/Bottomhost';
import BottomGuest from './_component/guest/Bottomguest';
import { useState } from 'react';
import { useRef, useEffect, useCallback } from "react";
import * as StompJs  from "@stomp/stompjs"
import { OpenVidu } from 'openvidu-browser';


const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? 'http://localhost:5000' : 'https://demos.openvidu.io/';


type Props = {
  params : { roomId : string } 
}
 

type UserStatus = {
  name : string
  status : number
}

type UserRole = {
  name : string
  role : string 
}

const USERID = `user${Math.random()}`

export default function Page({ params : { roomId } } : Props ) {
  const [isHost, setIsHost] = useState(false)
  const [ENTRY, setENTRY] = useState<UserStatus[]>([])
  const [mySessionId, setMySessionId] = useState(`Session${roomId}`)
  const [myUserName, setMyUserName] = useState(`Participant${Math.floor(Math.random() * 100)}`)


  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [session, setSession] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [publisher, setPublisher] = useState(undefined);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [role, setRole] = useState('');

  const changeHost = () => {
    setIsHost(prevIsHost => !prevIsHost);
    amIhost.current = !amIhost.current;
  }

  const client = useRef<any>({});
  const OV = useRef(new OpenVidu());

  const amIhost = useRef<boolean>(false);

  
  function onMessageReceived(message : StompJs.Message) {
    // console.log('나는 지금 host인가?' , amIhost.current)


    try {
      const messageBody = JSON.parse(message.body);
      
      if ((messageBody.code == 100)) {
        let newBody : UserStatus = {
          name : messageBody.id,
          status : 0
        }
        setENTRY(ENTRY => [...ENTRY, newBody])

        
      } else if (messageBody.code == 101){

        setENTRY(ENTRY => ENTRY.filter(item => item.name != messageBody.id))
        console.log(ENTRY)

      } else if (Math.floor(messageBody.code / 200) == 1){
        setENTRY(ENTRY => ENTRY.map((item) => {
          console.log(item.name, messageBody.id)
          if (item.name === messageBody.id){
            console.log(item.name)
            item.status = messageBody.code
          }
          return item;
        }))
      }

      else if ( !amIhost && messageBody.code === 300 && USERID === messageBody.name)
      {
        setRole(messageBody.role)
      }



    } catch (error) {
      console.error('Error parsing received message:', error);
    }
  }


  const getToken = useCallback(async () => {
        return createSession(mySessionId).then(sessionId =>
            createToken(sessionId),
        );
    }, [mySessionId]);

    const createSession = async (sessionId) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The sessionId
    };

    const createToken = async (sessionId) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The token
    };


    // const leaveSession = useCallback(() => {
    //   // Leave the session
    //   if (session) {
    //       session.disconnect();
    //   }
    //   console.log('나는 출력되고있다')
    //   // 상태관리중인 세션이 있을경우 초기화
    //   // Reset all states and OpenVidu object
    //   OV.current = new OpenVidu();
    //   setSession(undefined);
    //   setSubscribers([]);
    //   setMySessionId('SessionA');
    //   setMyUserName('Participant' + Math.floor(Math.random() * 100));
    //   setMainStreamManager(undefined);
    //   setPublisher(undefined);
    // }, [session]);


    const switchCamera = useCallback(async () => {
      try {
          const devices = await OV.current.getDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
  
          if (videoDevices && videoDevices.length > 1) {
              const newVideoDevice = videoDevices.filter(device => device.deviceId !== currentVideoDevice.deviceId);
  
              if (newVideoDevice.length > 0) {
                  const newPublisher = OV.current.initPublisher(undefined, {
                      videoSource: newVideoDevice[0].deviceId,
                      publishAudio: true,
                      publishVideo: true,
                      mirror: true,
                  });
                  // 새로운 퍼블리셔를 설정? 쉽게 말해 카메라 바꾸기, session객체는 publish, unpublish 를 통해서 카메라 바꿀 수 있음
                  if (session) {
                      await session.unpublish(mainStreamManager);
                      await session.publish(newPublisher);
                      setCurrentVideoDevice(newVideoDevice[0]);
                      setMainStreamManager(newPublisher);
                      setPublisher(newPublisher);
                  }
              }
          }
      } catch (e) {
          console.error(e);
      }
  }, [currentVideoDevice, session, mainStreamManager]);

    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    ///////////시작부터 마운트 될때/////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////


  useEffect(() => {

      // USERID를 일정하게 유지하는 방법
      // const USERID = `user${Math.random()}`
      
      const subscribe = () => {
          client.current.subscribe(`/sub/channel/${roomId}`, onMessageReceived)
        }

      function Join() {
        const message = {
          code: 100,
          id : USERID
        };
        // console.log(JSON.stringify(message))
        client.current.publish({
          destination: `/sub/channel/${roomId}`,
          body: JSON.stringify(message),
        });
      }
      
      
      function Disconnect() {
        const message = {
          code: 101,
          id : USERID
        };
        client.current.publish({
          destination: `/sub/channel/${roomId}`,
          body: JSON.stringify(message),
        })
      }


          // 커넥트 함수 /*
      const connect = () => {

          client.current = new StompJs.Client({
              brokerURL: "ws://localhost:8080/ws",
              onConnect : () => {
                  console.log("connected"); 
                  subscribe();
                  Join();
              },
              onDisconnect : () => {
                  console.log("failed to connect");
                  Disconnect();
              }
          })
          client.current.activate()
      }
      connect();


    // 컴포넌트가 언마운트될 때 이벤트 핸들러 제거


      // 오픈 vidu 파트

      // 객체 생성
    const mySession = OV.current.initSession(); 

    
    mySession.on('streamCreated', (event) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      console.log('타인 세션 확인용', event )
      setSubscribers((subscribers) => [...subscribers, subscriber]);
    });
    
    mySession.on('exception', (exception) => {
      console.warn(exception);
    });
    
    

    
    

    // const handleBeforeUnload = () => {
    //   leaveSession();
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);

    window.addEventListener('beforeunload', Disconnect);
    // mySession으로까지 저장 
    getToken().then(async (token) => {
      try {
        await mySession.connect(token, { clientData: myUserName });
        
        let publisher = await OV.current.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false,
        });
        
        mySession.publish(publisher);

          const devices = await OV.current.getDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const currentVideoDeviceId = publisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
          const currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

          setMainStreamManager(publisher);
          setPublisher(publisher);
          setCurrentVideoDevice(currentVideoDevice);  
      } catch (error) {
          console.log('There was an error connecting to the session:', error.code, error.message);
      }
    });

    

    return () => {
      window.removeEventListener('beforeunload', Disconnect);
    };

  }, [])
  

  return (
    // TODO : 화상 채팅방 구현

    <div className='flex flex-col items-center'>
    <div className=''>
      <Top 
      depart = '꿈나무 유치원'
      title = '망고 연극반'
      subscribers = {subscribers}
      />

      <p className='text-center'><button type='button' onClick = {changeHost}  className="text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-800   font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{isHost ? 'Host': 'Guest'}  </button></p>

      <div className='bottomcontainer'>
      {isHost? 
        <BottomHost 
          ENTRY = {ENTRY}
          client = {client.current}
          streamManager = {mainStreamManager}

        />
      : null}

      {!isHost?
        <BottomGuest 
          client = {client.current}  
          roomId = {roomId}
          role = {role}
          userId = {USERID ? USERID : ''}
        />
      : null

      }
      <Link href={`/scenario/1`}>링크</Link>
      </div>
    </div>
    </div>

  )
}
