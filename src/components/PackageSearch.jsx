import { h, Component } from 'ink'
import PropTypes from 'prop-types'

import { Package } from './Package'
import { Loading } from './Loading'
import { search } from '../lib/algolia'

const Status = {
  NOT_REQUESTED: 'not_requested',
  LOADING: 'loading',
  OBTAINED: 'obtained',
  ERROR: 'errr',
}

class PackageSearch extends Component {
  static propTypes = {
    query: PropTypes.string,
    limit: PropTypes.number,
    focus: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
  }

  static defaultProps = {
    query: '',
    limit: 5,
    focus: false,
  }

  state = {
    cursor: 0,
    status: Status.NOT_REQUESTED,
    packages: [],
  }

  async componentWillReceiveProps({ query }) {
    if (query !== this.props.query) {
      this.searchPackages(query)
    }
  }

  componentDidMount() {
    process.stdin.on('keypress', this.handleKeyPress)
  }

  componentWillUnmount() {
    process.stdin.removeListener('keypress', this.handleKeyPress)
  }

  handleKeyPress = (ch, key) => {
    switch (key.name) {
      case 'up':
        this.setState(({ cursor }) => ({
          cursor: cursor === 0 ? 0 : cursor - 1,
        }))
        break
      case 'down':
        this.setState(({ cursor }) => ({
          cursor: cursor + 1,
        }))
        break

      default:
        break
    }
  }

  searchPackages = async query => {
    this.setState({ status: Status.LOADING })

    try {
      const res = await search({
        query,
        attributesToRetrieve: [
          'name',
          'version',
          'description',
          'owner',
          'humanDownloadsLast30Days',
        ],
        offset: 0,
        length: 5,
      })

      if (res.query === this.props.query) {
        this.setState({
          cursor: 0,
          status: Status.OBTAINED,
          packages: res.hits,
        })
      }
    } catch (err) {
      this.setState({ status: Status.ERROR })
    }
  }

  render() {
    return
  }
}

export { PackageSearch }