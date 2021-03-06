/*
 * Copyright (C) 2018 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import {mockAssignment, mockComments} from '../../test-utils'
import StudentContent from '../StudentContent'
import {MockedProvider} from 'react-apollo/test-utils'
import {SUBMISSION_COMMENT_QUERY} from '../../assignmentData'

const mocks = [
  {
    request: {
      query: SUBMISSION_COMMENT_QUERY,
      variables: {
        submissionId: mockAssignment().submissionsConnection.nodes[0].id.toString()
      }
    },
    result: {
      data: {
        submissionComments: mockComments()
      }
    }
  }
]

beforeAll(() => {
  const found = document.getElementById('fixtures')
  if (!found) {
    const fixtures = document.createElement('div')
    fixtures.setAttribute('id', 'fixtures')
    document.body.appendChild(fixtures)
  }
})

afterEach(() => {
  ReactDOM.unmountComponentAtNode(document.getElementById('fixtures'))
})

describe('Assignment Student Content View', () => {
  it('renders the student header if the assignment is unlocked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    ReactDOM.render(<StudentContent assignment={assignment} />, document.getElementById('fixtures'))
    const element = $('[data-test-id="assignments-2-student-header"]')
    expect(element).toHaveLength(1)
  })

  it('renders the student header if the assignment is locked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: true}})
    ReactDOM.render(<StudentContent assignment={assignment} />, document.getElementById('fixtures'))
    const element = $('[data-test-id="assignments-2-student-header"]')
    expect(element).toHaveLength(1)
  })

  it('renders the assignment details and student content tab if the assignment is unlocked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    ReactDOM.render(<StudentContent assignment={assignment} />, document.getElementById('fixtures'))

    const contentTabs = $('[data-test-id="assignment-2-student-content-tabs"]')
    const toggleDetails = $('.a2-toggle-details-container')
    const root = $('#fixtures')
    expect(toggleDetails).toHaveLength(1)
    expect(contentTabs).toHaveLength(1)
    expect(root.text()).not.toMatch('Availability Dates')
  })

  it('renders the availability dates if the assignment is locked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: true}})
    ReactDOM.render(<StudentContent assignment={assignment} />, document.getElementById('fixtures'))

    const contentTabs = $('[data-test-id="assignment-2-student-content-tabs"]')
    const toggleDetails = $('.a2-toggle-details-container')
    const root = $('#fixtures')
    expect(toggleDetails).toHaveLength(0)
    expect(contentTabs).toHaveLength(0)
    expect(root.text()).toMatch('Availability Dates')
  })

  it('renders Comments', async () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    ReactDOM.render(
      <MockedProvider mocks={mocks} addTypename>
        <StudentContent assignment={assignment} />
      </MockedProvider>,
      document.getElementById('fixtures')
    )
    $('[data-test-id="assignment-2-student-content-tabs"] div:contains("Comments")')[0].click()
    await new Promise(setTimeout) // wait for response
    // We just need to kick an event loop to ensure the js actually is loaded.
    await new Promise(setTimeout)
    const container = $('[data-test-id="comments-container"]')
    expect(container).toHaveLength(1)
  })

  it('renders spinner while lazy loading comments', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    ReactDOM.render(
      <MockedProvider mocks={mocks} addTypename>
        <StudentContent assignment={assignment} />
      </MockedProvider>,
      document.getElementById('fixtures')
    )
    $('[data-test-id="assignment-2-student-content-tabs"] div:contains("Comments")')[0].click()
    const container = $('[data-test-id="loading-indicator"]')
    expect(container).toHaveLength(1)
  })
})
