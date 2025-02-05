function status(request, response) {
  response.status(200).json({
    request: "teste",
  });
}

export default status;
