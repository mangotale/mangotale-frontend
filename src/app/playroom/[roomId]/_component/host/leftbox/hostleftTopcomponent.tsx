import React, { useEffect, useState } from 'react'
import Image
 from 'next/image'
import piggie from '@/../public/piggie.svg'
import Actors from './Actors'


type Role = {
  name : string
}


type UserStatus = {
  name : string
  status : number
}

type Props = {
  ENTRY : UserStatus[]
  client : any
}


type UserRoleState = {
  name : string
  isSelected : boolean
}


const [rolestates, setRolestates]  = useState<UserRoleState[]>([]) 
export default function hostleftBottomcomponent(Props : Props) {


  const given_actors = [
    {
      name : '신데렐라',
    },
    {
      name : '돼지',
    },
    {
      name : '돼지지지',
    },
    {
      name : '찌찌찎',
    },
    {
      name : '커피마려워잉',
    },
  ]

  function sendRoles(role : string, name : string) {
    console.log(role, '은' , name ,'이 맡기로 했다')

  }

  useEffect(() => {
    console.log('hostLeftTopComponent', Props.ENTRY, '감지됨')
    setRolestates(Props.ENTRY.map((entry) => {
      let tmpState : UserRoleState = {
        name : entry.name,
        isSelected :  false
      }
      return tmpState
    }))

  }, [Props.ENTRY])

  return (
    <div className='h-2/5  bg-white rounded-md mb-5 p-5'>

    <div>
      <h1>역할 정하기</h1>
    </div>
      <div className=' overflow-auto scroll-auto p-5 h-4/5 '>
        {
          given_actors.map((role, id) => (
            <span className='flex justify-between'>
              <Actors 
                key={id}
                name = {role.name}
              />
              <select
              className=" border text-sm rounded-lg block w-1/3 p-2.5 "
              id={`roleSelect_${id}`}
              onChange={(e) => sendRoles(role.name, e.target.value)}
              >
                <option selected>아이를 선택하세요</option>
                {rolestates.map(
                  (state, id) => (
                    <option 
                    key={id}
                    value={state.name}
                    >{state.name}</option>
                  )
                )}
              </select>
            </span>
            ))
          
        }
      </div>  
    </div>
  )
}