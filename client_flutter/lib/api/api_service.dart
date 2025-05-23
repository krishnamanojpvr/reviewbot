import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:5000';

  Future<Map<String, dynamic>> register(
      String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/register'),
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception(
            'Failed to register: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/login'),
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception(
            'Failed to login: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  Future<Map<String, dynamic>> getMySearches(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/mysearches'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);

        // Validate the response structure
        if (responseData.containsKey('products') &&
            responseData['products'] is List) {
          return responseData;
        } else {
          throw Exception('Invalid API response structure');
        }
      } else {
        throw Exception(
            'Failed to load searches: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching searches: $e');
    }
  }

  Future<Map<String, dynamic>> getProductDetails(
      String productId, String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/product/$productId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception(
            'Failed to load product details: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching product details: $e');
    }
  }

  Future<String> sendQuery({
    required String productId,
    required String query,
    required String token,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/query'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'product_id': productId,
          'query': query,
        }),
      );

      if (response.statusCode == 200) {
        return response.body;
      } else {
        throw Exception(
            'Failed to send query: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error sending query: $e');
    }
  }

  Future<Map<String, dynamic>> searchProduct({
    required String url,
    required String token,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/search'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'url': url,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception(
            'Failed to search product: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error searching product: $e');
    }
  }

  Future<Map<String, dynamic>> deleteProduct({
    required String productId,
    required String token,
  }) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/api/delete'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'product_id': productId,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception(
            'Failed to delete product: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error deleting product: $e');
    }
  }
}
