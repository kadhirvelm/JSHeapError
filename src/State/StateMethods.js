
export default function checkAuthorization(props){
  if (!props.auth.isAuthenticated) {
      props.router.push('/')
    }
}

export function mapStateToProps(state) {
    const { biobots, auth, website, controlPanel } = state
    return {
      biobots,
      controlPanel,
      auth,
      website,
    }
  }