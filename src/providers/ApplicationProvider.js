import { UserAccountProvider } from '../providers/UserAccountProvider';
import { ConnectedAddressProvider } from '../providers/ConnectedAddressProvider';
import { TransactionQueueProvider} from '../providers/TransactionQueueProvider';
import { NetworksProvider } from '../providers/NetworksProvider';
import { SendTransactionProvider } from './SendTransactionProvider';

const ApplicationProviders = ({children}) => {
    return (
        <SendTransactionProvider>
            <NetworksProvider>
                <ConnectedAddressProvider>
                    <UserAccountProvider>
                        <TransactionQueueProvider>
                            { children }
                        </TransactionQueueProvider>
                    </UserAccountProvider>
                </ConnectedAddressProvider>
            </NetworksProvider>
        </SendTransactionProvider>
    )
}

export default ApplicationProviders