import { PropsWithChildren } from 'react';

export const Layout: React.FC<PropsWithChildren<{}>> = (props) => {
    return (
        <div className='flex flex-col items-center p-10' style={{ margin: '0px auto' }}>
            {props.children}
        </div>
    )
}

