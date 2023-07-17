import { ActionButton, ConnectWallet } from '@/components/buttons'
import { Layout } from '@/components/layout'
import { Art } from '@/components/misc/art'
import { useOuragan } from '@/hooks/useOuragan'
import { useTornadoLeaves } from '@/hooks/useTornadoLeaves'
import { useEffect, useState } from 'react'
import { User } from "../utils/lib/browser"
import { generateMerkleProof } from '@/utils/utils'

export default function Home() {

  const leaves = useTornadoLeaves();

  const [user, setUser] = useState(new User(BigInt(123)));
  const { depositAmount, root } = useOuragan();
  const [commitmentHex, setcommitmentHex] = useState('0x0137631a3d9cbfac8f5f7492fcfd4f45af982f6f0c8d1edd783c14d81ffffffe');

  useEffect(() => {
    (async () => {
      if (leaves && commitmentHex) {
        const data = await generateMerkleProof(leaves, 20, commitmentHex);
      }
    })()
  }, [leaves]);

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
