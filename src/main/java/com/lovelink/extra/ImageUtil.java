package com.lovelink.extra;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.commons.io.FilenameUtils;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.lovelink.io.PhotoResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImageUtil {

	public List<PhotoResponse> imageToBase64(List<String> photoUrls) {
		List<PhotoResponse> photoResponses = new ArrayList<PhotoResponse>();
		for (String string : photoUrls) {
			String fileName = Paths.get(string).getFileName().toString(); // Extract only the filename
			String publicUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/").path(fileName)
					.toUriString();

			// Create PhotoResponse object with base64 encoding of the image
			PhotoResponse photoResponse = new PhotoResponse();
			byte[] imageBytes = null;
			try {
				imageBytes = downloadImageFromFileSystem(string);
			} catch (IOException e) {
				log.error("Failed to read image from path: " + string);
				continue; // Skip this image and proceed with others
			}
			String base64Image = Base64.getEncoder().encodeToString(imageBytes);
			photoResponse.setBase64("data:image/jpeg;base64," + base64Image);
			photoResponse.setUrl(publicUrl); // Set the original URL or path
			photoResponses.add(photoResponse);
		}
		return photoResponses;
	}

	public List<MultipartFile> compressImages(List<MultipartFile> images) {
		List<MultipartFile> compressed = new ArrayList<>();
		if (images == null)
			return compressed;

		for (MultipartFile image : images) {
			try (InputStream in = image.getInputStream(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

				BufferedImage bufferedImage = ImageIO.read(in);
				if (bufferedImage == null)
					continue;

				// Convert to RGB if it has transparency
				BufferedImage rgbImage = new BufferedImage(bufferedImage.getWidth(), bufferedImage.getHeight(),
						BufferedImage.TYPE_INT_RGB);
				Graphics2D g = rgbImage.createGraphics();
				g.drawImage(bufferedImage, 0, 0, Color.WHITE, null);
				g.dispose();

				// Resize and compress
				Thumbnails.of(rgbImage).size(800, 800).outputFormat("jpg").outputQuality(0.6).toOutputStream(baos);

				MultipartFile compressedFile = new MockMultipartFile(
						FilenameUtils.getBaseName(image.getOriginalFilename()) + ".jpg",
						FilenameUtils.getBaseName(image.getOriginalFilename()) + ".jpg", "image/jpeg",
						baos.toByteArray());

				compressed.add(compressedFile);
			} catch (IOException e) {
				// log and skip
				log.error("Failed to compress: " + image.getOriginalFilename());
			}
		}

		return compressed;
	}

	private byte[] downloadImageFromFileSystem(String filePath) throws IOException {
		return Files.readAllBytes(new File(filePath).toPath());
	}

}
