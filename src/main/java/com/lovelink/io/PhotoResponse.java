package com.lovelink.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {
	private String url; // Original stored path or URL
	private String base64; // Base64 encoded image preview
}
