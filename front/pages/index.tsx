import { ActionButton, ConnectWallet } from '@/components/buttons'
import { Layout } from '@/components/layout'
import { Art } from '@/components/misc/art'
import { useOuragan } from '@/hooks/useOuragan'
import { useTornadoLeaves } from '@/hooks/useTornadoLeaves'
import { useEffect, useState } from 'react'
import { User } from "../utils/lib/browser"
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
const { buildBabyjub, buildMimcSponge } = require('circomlibjs');

export default function Home() {

  const leaves = useTornadoLeaves();
  const [user, setUser] = useState(new User(BigInt(123)));
  const { depositAmount, root } = useOuragan();

  console.log("Current root: ", root);
  

  return (
    <Layout>
      <div className='flex justify-center'>
        <Art />
      </div>
      <div className='py-5'>
        <ConnectWallet />
      </div>
      <div className='py-5'>
        <ActionButton actionText='Ask' args={[]} functionName='ask' />
      </div>
      <div className='py-5'>
        <ActionButton actionText='Order' args={[depositAmount]} functionName='order' />
      </div>
      <div className='py-5'>
        <ActionButton actionText='Fill' args={[depositAmount]} functionName='fill' />
      </div>
    </ Layout>
  )
}
