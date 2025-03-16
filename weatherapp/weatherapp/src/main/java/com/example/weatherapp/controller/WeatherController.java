package com.example.weatherapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "http://localhost:3000")
public class WeatherController {

    @Value("${weather.api.key}") 
    private String apiKey;

    private final String WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric";
    private final String FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric";

    @GetMapping("/{city}")
    public ResponseEntity<Map<String, Object>> getWeather(@PathVariable String city) {
        String url = String.format(WEATHER_API_URL, city, apiKey);
        RestTemplate restTemplate = new RestTemplate();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "City not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to fetch weather data"));
        }
    }

    @GetMapping("/forecast/{city}")
    public ResponseEntity<Map<String, Object>> getForecast(@PathVariable String city) {
        String url = String.format(FORECAST_API_URL, city, apiKey);
        RestTemplate restTemplate = new RestTemplate();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "City not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to fetch forecast data"));
        }
    }
}