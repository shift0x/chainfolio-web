import PropTypes from 'prop-types';
import { Box } from "@mui/material";
import { StyledMenuItem } from './StyledMenuItem';
import { StyledSelect } from './StyledSelect';
import { StyledCaption } from './StyledCaption';
import { useChainId } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';
import { getNetworks } from '../lib/networks/networks';

const networks = getNetworks()


function NetworkSelector({onNetworkChanged}){
    const [selectedNetworkIndex, setSelectedNetworkIndex] = useState(-1);
    const selectedNetwork = selectedNetworkIndex == -1 ? null : networks[selectedNetworkIndex];
    const currentChainId = useChainId();

    useEffect(() => {
        onNetworkChanged(selectedNetwork);
    }, [selectedNetworkIndex])

    useEffect(() => {
        if(selectedNetworkIndex != -1)
            return;

        const connectedChainIndex = networks.map(n => { return n.chainId.toString() }).indexOf(currentChainId.toString());

        if(connectedChainIndex != -1){ 
            setSelectedNetworkIndex(connectedChainIndex);
        }
    }, [selectedNetworkIndex])

    return (
        <Box>

            <StyledCaption>Network</StyledCaption>

            <StyledSelect
                value={selectedNetworkIndex} 
                onChange={(e) => { setSelectedNetworkIndex(e.target.value) }}>

                { networks.map((network, index) => (
                    <StyledMenuItem value={index}>
                        <img src={network.icon} height="25px" width="25px" />&nbsp;{network.name}
                    </StyledMenuItem>
                ))}
            </StyledSelect>

        </Box>
    )
}

NetworkSelector.propTypes = {
    onNetworkChanged: PropTypes.func.isRequired,
};

export default NetworkSelector