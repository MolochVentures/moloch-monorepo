import {
  repository, Filter, Condition, DataObject,
} from '@loopback/repository';
import {
  post,
  get,
  requestBody,
} from '@loopback/rest';
import {
  Asset,
  Event,
  Member,
  Period,
  Project
} from '../models';
import {
  AssetRepository,
  ConfigRepository,
  EventRepository,
  MemberRepository,
  PeriodRepository,
  ProjectRepository
} from '../repositories';
import { HttpError } from 'http-errors';

export class EventController {
  constructor(
    @repository(AssetRepository)
    public assetRepository: AssetRepository,
    @repository(ConfigRepository)
    public configRepository: ConfigRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
    @repository(PeriodRepository)
    public periodRepository: PeriodRepository,
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) { }

  /**
   * Returns all existing events.
   */
  @get('/events', {
    responses: {
      '200': {
        description: 'Returned all events.',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Event } },
          },
        },
      },
    },
  })
  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find();
  }

  /**
   * Creates a event.
   * @param event: event to be created.
   */
  @post('/events', {
    responses: {
      '200': {
        description: 'Event created.',
        content: { 'application/json': { schema: { 'x-ts-type': Event } } },
      },
    },
  })
  async create(@requestBody() event: Event): Promise<any> {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    event.id = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    switch (event.name) {
      case 'Cron job':
        let today = new Date();
        let filterCurrent = {
          where:
          {
            start: { lte: today },
            end: { gte: today }
          }
        }
        return await this.periodRepository.find(filterCurrent).then(async periods => {
          let memberFilter: Array<any> = [];
          let projectFilter: Array<any> = [];
          periods.forEach(period => {
            period.proposals.forEach(periodProposal => {
              let endDays = Math.round((period.end.getTime() - today.getTime()) / 1000 / 60 / 60 / 24);
              let graceDays = Math.round((period.gracePeriod.getTime() - today.getTime()) / 1000 / 60 / 60 / 24);
              if (periodProposal.type === 'member') {
                memberFilter.push({ id: period.id, end: endDays, gracePeriod: graceDays });
              } else {
                projectFilter.push({ id: period.id, end: endDays, gracePeriod: graceDays });
              }
            });
          });
          return await this.memberRepository.find().then(async members => {
            members.forEach(member => {
              if (memberFilter.findIndex(k => k.id === member.period) >= 0 && member.status === 'pending') {
                member.status = 'inprogress';
                member.end = memberFilter.find(k => k.id === member.period).end;
                member.gracePeriod = memberFilter.find(k => k.id === member.period).gracePeriod;
              } else if (member.status === 'inprogress') {
                member.status = 'pending';
                member.end = member.gracePeriod = 0;
              }
              this.memberRepository.updateById(member.address, member);
            });
            return await this.projectRepository.find().then(async projects => {
              projects.forEach(project => {
                if (projectFilter.findIndex(k => k.id === project.period) >= 0 && project.status === 'pending') {
                  project.status = 'inprogress';
                  project.end = projectFilter.find(k => k.id === project.period).end;
                  project.gracePeriod = projectFilter.find(k => k.id === project.period).gracePeriod;
                } else if (project.status === 'inprogress') {
                  project.status = 'pending';
                  project.end = project.gracePeriod = 0;
                }
                this.projectRepository.updateById(project.id, project);
              });
              return await this.eventRepository.create(event);
            });
          });
        });
      case 'User creation':
        let memberCreate = event.payload as Member;
        memberCreate.nonce = Math.floor(Math.random() * 1000000);
        return await this.memberRepository.create(memberCreate).then(async result => {
          return await this.eventRepository.create(event);
        });
      case 'Membership proposal':
        let memberPatch = event.payload as Member;
        memberPatch.name = memberPatch.address;
        // Current date at midnight
        let currentDate = new Date();
        currentDate.setHours(1, 0, 0, 0);
        // Add the new proposal to the list of proposals of the member that submitted it
        if (!memberPatch.proposals) {
          memberPatch.proposals = [];
        }
        memberPatch.proposals.push({id: memberPatch.address, title: memberPatch.title ? memberPatch.title : '', vote: 'owner', date: currentDate});
        // Recover the config data to define a new period
        return await this.configRepository.find().then(async config => {
          // Config data
          let periodLength = config[0].periodLength;
          let gracePeriodLength = config[0].gracePeriod;
          // Check if there is a period for the current date
          return await this.periodRepository.find({ where: { start: { eq: currentDate } } }).then(async period => {
            let periodCreate: Period = new Period;
            periodCreate.id = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
            periodCreate.proposals = [{ id: memberPatch.address, type: 'member' }];
            // If there is a period on that date
            if (period && period.length) {
              return await this.periodRepository.find().then(async periods => {
                // There can't be another period for the same date, so check what is the closest date available
                let lastPeriodDate = currentDate;
                periods.forEach(potentialLastPeriod => {
                  if (potentialLastPeriod.start.getTime() > lastPeriodDate.getTime()) {
                    lastPeriodDate = potentialLastPeriod.start;
                  }
                });
                periodCreate.start = new Date(lastPeriodDate.getTime() + (1000 * 60 * 60 * 24));
                periodCreate.end = new Date(periodCreate.start.getTime() + (1000 * 60 * 60 * 24 * periodLength));
                periodCreate.gracePeriod = new Date(periodCreate.end.getTime() + (1000 * 60 * 60 * 24 * gracePeriodLength));
                // And create a period for it
                return await this.periodRepository.create(periodCreate).then(async newPeriod => {
                  memberPatch.period = newPeriod.id; // Assign it to the member
                  memberPatch.status = 'pending';
                  // And update the member
                  return await this.memberRepository.updateById(memberPatch.address, memberPatch).then(async result => {
                    return await this.eventRepository.create(event);
                  });
                });
              });
            } else { // If there isn't a period on that date
              periodCreate.start = currentDate;
              periodCreate.end = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24 * periodLength));
              periodCreate.gracePeriod = new Date(periodCreate.end.getTime() + (1000 * 60 * 60 * 24 * gracePeriodLength));
              // Create the period
              return await this.periodRepository.create(periodCreate).then(async newPeriod => {
                memberPatch.period = newPeriod.id; // Assign it to the member
                memberPatch.status = 'inprogress';
                // And create the member
                return await this.memberRepository.updateById(memberPatch.address, memberPatch).then(async result => {
                  return await this.eventRepository.create(event);
                });
              });
            }
          });
        });
      case 'Project proposal':
        // Project data
        let receivedData = event.payload as any;
        let projectCreate = receivedData.project as Project;
        let ownerAddress = receivedData.owner as string;
        projectCreate.id = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        // Recover the config data to define a new period
        return await this.configRepository.find().then(async config => {
          // Config data
          let periodLength = config[0].periodLength;
          let gracePeriodLength = config[0].gracePeriod;
          // Current date at midnight
          let currentDate = new Date();
          currentDate.setHours(1, 0, 0, 0);
          // Check if there is a period for the current date
          return await this.periodRepository.find({ where: { start: { eq: currentDate } } }).then(async period => {
            let periodCreate: Period = new Period;
            periodCreate.id = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
            periodCreate.proposals = [{ id: projectCreate.id, type: 'project' }];
            // If there is a period on that date
            if (period && period.length) {
              return await this.periodRepository.find().then(async periods => {
                // There can't be another period for the same date, so check what is the closest date available
                let lastPeriodDate = periods[periods.length - 1].start;
                periods.forEach(potentialLastPeriod => {
                  if (potentialLastPeriod.start.getTime() > lastPeriodDate.getTime()) {
                    lastPeriodDate = potentialLastPeriod.start;
                  }
                });
                periodCreate.start = new Date(lastPeriodDate.getTime() + (1000 * 60 * 60 * 24));
                periodCreate.end = new Date(periodCreate.start.getTime() + (1000 * 60 * 60 * 24 * periodLength));
                periodCreate.gracePeriod = new Date(periodCreate.end.getTime() + (1000 * 60 * 60 * 24 * gracePeriodLength));
                // And create a period for it
                return await this.periodRepository.create(periodCreate).then(async newPeriod => {
                  projectCreate.period = newPeriod.id; // Assign it to the project
                  projectCreate.status = 'pending';
                  // And create the project
                  return await this.projectRepository.create(projectCreate).then(async project => {
                    // Get the member that submitted the project
                    return await this.memberRepository.findById(ownerAddress).then(async matchingMember => {
                      // And add the new proposal that they have submitted to their list of proposals
                      if (!matchingMember.proposals) {
                        matchingMember.proposals = [];
                      }
                      matchingMember.proposals.push({id: projectCreate.id, title: projectCreate.title, vote: 'owner', date: currentDate});
                      return await this.memberRepository.updateById(matchingMember.address, matchingMember).then(async result => {
                        return await this.eventRepository.create(event);
                      });
                    });                    
                  });
                });
              });
            } else { // If there isn't a period on that date
              periodCreate.start = currentDate;
              periodCreate.end = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24 * periodLength));
              periodCreate.gracePeriod = new Date(periodCreate.end.getTime() + (1000 * 60 * 60 * 24 * gracePeriodLength));
              // Create the period
              return await this.periodRepository.create(periodCreate).then(async newPeriod => {
                projectCreate.period = newPeriod.id; // Assign it to the project
                // And create the project
                return await this.projectRepository.create(projectCreate).then(async result => {
                  // Get the member that submitted the project
                  return await this.memberRepository.findById(ownerAddress).then(async matchingMember => {
                    // And add the new proposal that they have submitted to their list of proposals
                    if (!matchingMember.proposals) {
                      matchingMember.proposals = [];
                    }
                    matchingMember.proposals.push({id: projectCreate.id, title: projectCreate.title, vote: 'owner', date: currentDate});
                    return await this.memberRepository.updateById(matchingMember.address, matchingMember).then(async result => {
                      return await this.eventRepository.create(event);
                    });
                  });
                });
              });
            }
          });
        });
      case 'Project proposal voted':
        let projectVoted = event.payload as Project;
        let lastProjectVoter = projectVoted.voters ? projectVoted.voters[projectVoted.voters.length - 1] : { member: '', vote: '' };
        // Add the voter to the proposal
        return await this.projectRepository.updateById(projectVoted.id, projectVoted).then(async result => {
          // Add the proposal to the member that has voted just now
          return await this.memberRepository.findById(lastProjectVoter.member).then(async member => {
            if (!member.proposals) {
              member.proposals = [];
            }
            member.proposals.push({ id: projectVoted.id, title: projectVoted.title, vote: lastProjectVoter.vote, date: new Date() });
            return await this.memberRepository.updateById(member.address, member).then(async updatedMember => {
              return await this.eventRepository.create(event);
            });
          });
        });
      case 'Project proposal processed':
        let projectProcessed = event.payload as Project;
        projectProcessed.status = 'accepted';
        return await this.projectRepository.updateById(projectProcessed.id, projectProcessed).then(async result => {
          return await this.eventRepository.create(event);
        });
      case 'Membership proposal voted':
        let memberVoted = event.payload as Member;
        let lastMemberVoter = memberVoted.voters ? memberVoted.voters[memberVoted.voters.length - 1] : { member: '', vote: '' };
        // Add the voter to the proposal
        return await this.memberRepository.updateById(memberVoted.address, memberVoted).then(async result => {
          // Add the proposal to the member that has voted just now
          return await this.memberRepository.findById(lastMemberVoter.member).then(async member => {
            if (!member.proposals) {
              member.proposals = [];
            }
            member.proposals.push({ id: memberVoted.address, title: memberVoted.title ? memberVoted.title : '', vote: lastMemberVoter.vote, date: new Date() });
            return await this.memberRepository.updateById(member.address, member).then(async updatedMember => {
              return await this.eventRepository.create(event);
            });
          });
        });
      case 'Membership proposal processed':
        let memberProcessed = event.payload as Member;
        memberProcessed.status = 'active';
        return await this.memberRepository.updateById(memberProcessed.address, memberProcessed).then(async result => {
          return await this.eventRepository.create(event);
        });
      case 'Period creation':
        let periodCreated = event.payload as Period;
        periodCreated.id = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        return await this.periodRepository.create(periodCreated).then(async result => {
          return await this.eventRepository.create(event);
        });
      case 'Asset creation':
        let assetCreated = event.payload as Asset;
        return await this.assetRepository.findById(assetCreated.address).then(async result => {
          if (result) {
            assetCreated.amount = assetCreated.amount + result.amount;
            return await this.assetRepository.updateById(assetCreated.address, assetCreated).then(async result => {
              return await this.eventRepository.create(event);
            });
          } else {
            return await this.assetRepository.create(assetCreated).then(async result => {
              return await this.eventRepository.create(event);
            });
          }
        }).catch(async error => {
          return await this.assetRepository.create(assetCreated).then(async result => {
            return await this.eventRepository.create(event);
          });
        });
      case 'Redeem loot token':
        let addressRedeemed = (event.payload as Member).address;
        // Get the full data of the member that will redeem its shares
        return await this.memberRepository.findById(addressRedeemed).then(async member => {
          // Get all the current periods that have a gracePeriod above the current date
          return await this.periodRepository.find({ where: { start: { lte: new Date() }, gracePeriod: { gte: new Date() } } }).then(async periods => {
            let memberProposals = member.proposals ? member.proposals : [];
            let canRedeem = true;
            // Only continue checking if there are any periods that might affect the redeeming
            if (periods && periods.length > 0) {
              // Get all the ids of the periods that might affect the redeeming
              let periodIds: Array<string> = [];
              periods.forEach(period => { periodIds.push(period.id) });
              // Get the membership proposals associated to those periods
              return await this.memberRepository.find({ where: { period: { inq: periodIds }}}).then(async currentMemberProposals => {
                // Check if any of them should prevent the user from redeeming
                currentMemberProposals.forEach(memberProposal => {
                  let matchingProposalIndex = memberProposals.findIndex(k => k.id === memberProposal.address);
                  if (matchingProposalIndex >= 0 && // If the user has a proposal that is within the grace period and
                    ((memberProposal.status === 'active' && memberProposals[matchingProposalIndex].vote === 'yes') || // The proposal gets approved and they voted yes on said proposal or
                    (memberProposal.status === 'inactive' && memberProposals[matchingProposalIndex].vote === 'no'))) { // The proposal gets rejected and they voted no on said proposal
                      canRedeem = false; // Then the user can't redeem  
                    }
                });
                // Get the project proposals associated to those periods
                return await this.projectRepository.find({ where: { period: { inq: periodIds }}}).then(async currentProjectProposals => {
                  // Check if any of them should prevent the user from redeeming
                  currentProjectProposals.forEach(projectProposal => {
                    let matchingProposalIndex = memberProposals.findIndex(k => k.id === projectProposal.id);
                    if (matchingProposalIndex >= 0 && // If the user has a proposal that is within the grace period and
                      ((projectProposal.status === 'accepted' && memberProposals[matchingProposalIndex].vote === 'yes') || // The proposal gets approved and they voted yes on said proposal or
                      (projectProposal.status === 'rejected' && memberProposals[matchingProposalIndex].vote === 'no'))) { // The proposal gets rejected and they voted no on said proposal
                        canRedeem = false; // Then the user can't redeem  
                      }
                  });
                  // Only redeem if none of the proposals matched the previous conditions
                  if (canRedeem) {
                    // We can redeem, so first we get the total shares of the system and calculate the percentage represented by the member redeeming
                    return await this.memberRepository.find().then(async members => {
                      let totalShares = 0;
                      let redeemingMemberShares = member.shares ? member.shares : 0;
                      members.forEach(member => { totalShares = totalShares + (member.shares ? member.shares : 0) });
                      // Then we deduct the assets proportionately to the shares of the member
                      return await this.assetRepository.find().then(async assets => {
                        assets.forEach(asset => {
                          asset.amount = asset.amount - (asset.amount * redeemingMemberShares / totalShares);
                          this.assetRepository.updateById(asset.address, asset);
                        });
                        member.status = 'inactive';
                        member.shares = 0;
                        // And deactivate the member
                        return await this.memberRepository.updateById(member.address, member).then(async result => {
                          return await this.eventRepository.create(event);
                        });
                      });
                    });
                  } else {
                    event.name = "Error on Redeem loot token";
                    return await this.eventRepository.create(event).then(async result => {
                      let error: HttpError = new HttpError;
                      error.status = 400;
                      error.message = "The member is still within the grace period of a voted proposal."
                      return await error;
                    });
                  }
                });
              });
            } else { // If we get here, there were no periods that might affect the redeeming
              // First we get the total shares of the system and calculate the percentage represented by the member redeeming
              return await this.memberRepository.find().then(async members => {
                let totalShares = 0;
                let redeemingMemberShares = member.shares ? member.shares : 0;
                members.forEach(member => { totalShares = totalShares + (member.shares ? member.shares : 0) });
                // Then we deduct the assets proportionately to the shares of the member
                return await this.assetRepository.find().then(async assets => {
                  assets.forEach(asset => {
                    asset.amount = asset.amount - (asset.amount * redeemingMemberShares / totalShares);
                    this.assetRepository.updateById(asset.address, asset);
                  });
                  member.status = 'inactive';
                  member.shares = 0;
                  // And deactivate the member
                  return await this.memberRepository.updateById(member.address, member).then(async result => {
                    return await this.eventRepository.create(event);
                  });
                });
              });
            }
          });
        });
    }
    event.name = "Error: Unidentified event";
    return await this.eventRepository.create(event).then(result => { return event });
  }
}
