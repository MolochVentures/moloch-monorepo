import { combineReducers } from 'redux';
import MembersReducers from './MembersReducers'
import MemberDetailReducers from './MemberDetailReducers';
import ProposalsReducers from './ProposalsReducers';
import ProposalDetailReducers from './ProposalDetailReducers';
import EventsReducers from './EventsReducers';
import FounderReducers from './FounderReducers';
import AssetDataReducers from './AssetReducers';
import AssetAmountReducers from './AssetAmountReducers';
import MemberWithSharesReducers from './MemberWithSharesReducers';


export default combineReducers({
    members: MembersReducers,
    memberDetail: MemberDetailReducers,
    proposals: ProposalsReducers,
    proposalDetail: ProposalDetailReducers,
    events: EventsReducers,
    founders: FounderReducers,
    assetData: AssetDataReducers,
    assetAmount: AssetAmountReducers,
    membersWithShares: MemberWithSharesReducers
});