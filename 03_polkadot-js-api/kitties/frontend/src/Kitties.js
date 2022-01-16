import React, { useEffect, useState } from 'react'
import { Form, Grid, Item } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

const constructKitty = (hash, { dna, owner }) => ({
  id: hash,
  dna,
  owner: owner.toJSON()
});

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kittiesCount, setKittiesCount] = useState([])
  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  const fetchKittiesCount = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    // let unsub = null;

    // const asyncFetch = async () => {
    //   unsub = await api.query.KittiesModule.kitties.multi(kittyHashes, kitties => {
    //     const kittyArr = kitties
    //       .map((kitty, ind) => constructKitty(kittyHashes[ind], kitty.value));
    //     setKitties(kittyArr);
    //   });
    // };

    // asyncFetch();

    // // return the unsubscription cleanup function
    // return () => {
    //   unsub && unsub();
    // };

    api.query.kittiesModule.kittiesCount(
      c => {
        if(c > 0) {
          setKittiesCount(_.parseInt(c))
        }
      }
    ).catch(console.error)
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    // const kitties = []
    // setKitties(kitties)

    if (kittiesCount > 0) {
      const idArr = [...new Array(kittiesCount).keys()]
      const ownerQuery = api.query.kittiesModule.owner.multi(idArr)
      const kittiesQuery = api.query.kittiesModule.kitties.multi(idArr)
      Promise.all([ownerQuery, kittiesQuery]).then( r => {
        const [_owner, _kitties] = r
        setKitties(_.map(_kitties, (item, i) => {
          return {
            id: i,
            dna: item.unwrap(),
            owner: _owner[i].unwrap().toString() 
          }
        }))
      })
    }
  }

  useEffect(fetchKittiesCount, [api, keyring])
  useEffect(populateKitties, [api, kittiesCount])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'KittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
