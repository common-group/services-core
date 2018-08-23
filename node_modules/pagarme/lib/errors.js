class ApiError extends Error {
  constructor (response) {
    super(response)
    this.name = 'ApiError'
    this.response = response
  }
}

export default ApiError
