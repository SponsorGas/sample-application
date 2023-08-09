import { useSwitchNetwork } from '@/hooks/useSwitchNetwork'
import Dropdown, { DropdownOption } from '../Dropdown'
import { useEffect, useState } from 'react'
import { config } from '@/lib/config'

const SwitchNetwork = () => {
  const { switchNetwork } = useSwitchNetwork();
  const networkId = process.env.NEXT_PUBLIC_NETWORK_ID;
  const chains: DropdownOption[] = Object.entries(config).map(([chainId, chainConfig]) => ({
    'id': chainId,
    'name': chainConfig.name,
    'value': chainId,
  }));
  
  // Set a default network based on the networkId if available, otherwise, set to the first chain
  const defaultNetwork = chains.find(chain => chain.value === networkId) || chains[0];
  console.log(defaultNetwork)
  const [selected, setSelected] = useState(defaultNetwork);

  useEffect(() => {
    if (selected) {
      switchNetwork(selected.value);
    }
  }, [selected, switchNetwork]);

  return (
    <> 
      <div className="flex-1">
        <Dropdown options={chains} setSelected={setSelected} selected={selected} />
      </div>
    </>
  );
}

export default SwitchNetwork;