import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {DragSource as dragSource} from 'react-dnd'
// import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {AGENDA_ITEM, phaseArray} from 'universal/utils/constants'
import {requestIdleCallback} from 'universal/utils/requestIdleCallback'
import styled, {css} from 'react-emotion'
import MeetingSubnavItem from 'universal/components/MeetingSubnavItem'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'

const taskSource = {
  beginDrag (props) {
    return {
      id: props.agendaItem.id
    }
  }
}

const lineHeight = ui.navTopicLineHeight

const DeleteIconButton = styled('div')(({agendaLength, disabled}) => ({
  color: appTheme.palette.warm,
  cursor: 'pointer',
  display: 'block',
  height: '1.5rem',
  // we can make the position of the del (x) more centered when there’s a low number of agenda items
  left: agendaLength < 10 ? '.8125rem' : ui.meetingSidebarGutter,
  lineHeight,
  opacity: 0,
  position: 'absolute',
  textAlign: 'center',
  top: '.5rem',
  transition: 'opacity .1s ease-in',
  visibility: disabled && 'hidden',
  width: ui.iconSize
}))

const DeleteIcon = styled(StyledFontAwesome)({
  display: 'block',
  height: lineHeight,
  lineHeight,
  width: '1.25rem'
})

const AvatarBlock = styled('div')({
  width: '2rem'
})

const rootStyles = css({
  position: 'relative',
  '&:hover > div': {
    opacity: 1
  }
})

class AgendaItem extends Component {
  static propTypes = {
    agendaItem: PropTypes.object.isRequired,
    agendaLength: PropTypes.number.isRequired,
    canNavigate: PropTypes.bool,
    connectDragSource: PropTypes.func.isRequired,
    content: PropTypes.string,
    disabled: PropTypes.bool,
    ensureVisible: PropTypes.bool,
    handleRemove: PropTypes.func,
    idx: PropTypes.number,
    inSync: PropTypes.bool,
    isCurrent: PropTypes.bool,
    isComplete: PropTypes.bool,
    isFacilitator: PropTypes.bool,
    facilitatorPhase: PropTypes.oneOf(phaseArray),
    gotoAgendaItem: PropTypes.func,
    localPhase: PropTypes.oneOf(phaseArray),
    localPhaseItem: PropTypes.number,
    teamMember: PropTypes.object
  }

  componentDidMount () {
    if (this.props.ensureVisible) {
      requestIdleCallback(() => {
        // does not force centering; no animation for initial load
        this.el.scrollIntoViewIfNeeded()
      })
    }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.ensureVisible && this.props.ensureVisible) {
      // without RIC only gets called ~20% of the time in Chrome64 on Ubuntu 16.04 if behavior: smooth
      requestIdleCallback(() => {
        this.el.scrollIntoView({behavior: 'smooth'})
      })
    }
  }

  el = null

  render () {
    const {
      agendaItem,
      agendaLength,
      canNavigate,
      connectDragSource,
      disabled,
      idx,
      inSync,
      isCurrent,
      isFacilitator,
      handleRemove,
      localPhase,
      facilitatorPhase,
      gotoAgendaItem,
      localPhaseItem
    } = this.props
    const {content, isComplete, teamMember = {}} = agendaItem
    const isLocal = idx + 1 === localPhaseItem
    const canDelete = !isComplete && !isCurrent && !disabled
    const inAgendaGroupLocal = inAgendaGroup(localPhase)
    const inAgendaGroupFacilitator = inAgendaGroup(facilitatorPhase)
    const isUnsyncedFacilitatorStage = inAgendaGroupFacilitator && isFacilitator && !inSync
    const navItemState = {
      isActive: inAgendaGroupLocal && isLocal,
      isComplete,
      isDisabled: disabled,
      isUnsyncedFacilitatorStage
    }
    const avatar = (
      <AvatarBlock>
        <Avatar hasBadge={false} picture={teamMember.picture} size='smallest' />
      </AvatarBlock>
    )
    const deleteLabel = 'Remove this agenda topic'
    return connectDragSource(
      <div
        className={rootStyles}
        title={content}
        ref={(el) => {
          this.el = el
        }}
      >
        <MeetingSubnavItem
          label={content}
          metaContent={avatar}
          onClick={canNavigate && !disabled ? gotoAgendaItem : null}
          orderLabel={`${idx + 1}.`}
          {...navItemState}
        />
        {canDelete &&
          !isUnsyncedFacilitatorStage && (
            <DeleteIconButton
              aria-label={deleteLabel}
              agendaLength={agendaLength}
              disabled={disabled}
              onClick={handleRemove}
              title={deleteLabel}
            >
              <DeleteIcon name='times-circle' />
            </DeleteIconButton>
          )}
      </div>
    )
  }
}

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
})

export default createFragmentContainer(
  dragSource(AGENDA_ITEM, taskSource, dragSourceCb)(AgendaItem),
  graphql`
    fragment AgendaItem_agendaItem on AgendaItem {
      id
      content
      isComplete
      teamMember {
        picture
      }
    }
  `
)
