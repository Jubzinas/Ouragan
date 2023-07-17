import { ActionButton, ConnectWallet } from '@/components/buttons'
import { Layout } from '@/components/layout'
import { Art } from '@/components/misc/art'
import { useOuragan } from '@/hooks/useOuragan'
import { useTornadoLeaves } from '@/hooks/useTornadoLeaves'

export default function Home() {

  const leaves = useTornadoLeaves();
  console.log(leaves);
  
  const { depositAmount } = useOuragan();

  return (
    <Layout>
      <div className='flex justify-center'>
        <Art />
      </div>
      <div className='py-5'>
        <ConnectWallet />
      </div>
      <div className='py-5'>
        <ActionButton actionText='Ask' args={[depositAmount]} functionName='ask' />
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
