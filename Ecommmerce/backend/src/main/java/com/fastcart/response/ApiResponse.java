package com.fastcart.response;

public class ApiResponse<T> {
	private T response;

	public ApiResponse(T response) {
		super();
		this.response = response;
	}

	public T getResponse() {
		return response;
	}

	public void setResponse(T response) {
		this.response = response;
	}

}
