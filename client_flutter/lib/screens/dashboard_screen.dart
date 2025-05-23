import 'package:flutter/material.dart';
import 'package:client_flutter/api/api_service.dart';
import 'package:client_flutter/screens/product_detail_screen.dart';
import 'package:client_flutter/utils/shared_prefs.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  DashboardScreenState createState() => DashboardScreenState();
}

class DashboardScreenState extends State<DashboardScreen> {
  Future<Map<String, dynamic>>? recentSearches;
  final ApiService apiService = ApiService();
  String? token;
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _loadToken();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadToken() async {
    token = await SharedPrefs.getToken();
    _refreshProducts();
  }

  Future<void> _refreshProducts() async {
    setState(() {
      recentSearches = apiService.getMySearches(token!);
    });
  }

  Future<void> _searchProduct() async {
    final url = _searchController.text.trim();
    if (url.isEmpty) return;

    setState(() {
      _isSearching = true;
    });

    try {
      final response = await apiService.searchProduct(url: url, token: token!);
      if (response['success'] == true) {
        if (!mounted) return;
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailScreen(
              productId: response['product_id'],
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Search failed: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
          _searchController.clear();
        });
      }
    }
  }

  Future<void> _deleteProduct(String productId) async {
    try {
      final response = await apiService.deleteProduct(
        productId: productId,
        token: token!,
      );

      if (response['success'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Product deleted successfully')),
        );
        _refreshProducts();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete product: $e')),
      );
      _refreshProducts();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [Color(0xFFD946EF), Color(0xFFA5B4FC)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(bounds),
          child: const Text(
            'ReviewBot',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 24,
              letterSpacing: 1,
            ),
          ),
        ),
        actions: [
          PopupMenuButton<int>(
            icon: const Icon(Icons.more_vert, color: Color(0xFFD946EF)),
            onSelected: (value) async {
              if (value == 1) {
                final shouldLogout = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: const Color(0xFF18181B),
                    title: const Text('Confirm Logout', style: TextStyle(color: Colors.white)),
                    content: const Text('Are you sure you want to logout?', style: TextStyle(color: Colors.white70)),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('Cancel', style: TextStyle(color: Color(0xFFA5B4FC))),
                      ),
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        child: const Text('Logout', style:  TextStyle(color: Colors.red)),
                      ),
                    ],
                  ),
                );
                if (shouldLogout == true) {
                  final navigator = Navigator.of(context);
                  await SharedPrefs.clearToken();
                  if (!mounted) return;
                  navigator.pushReplacementNamed('/login');
                }
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem<int>(
                value: 0,
                enabled: false,
                child: FutureBuilder<String?>(
                  future: SharedPrefs.getUsername(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Text('Loading...');
                    } else if (snapshot.hasError || !snapshot.hasData || snapshot.data == null) {
                      return const Text('Username');
                    } else {
                      return Text(snapshot.data!,style: const TextStyle(color: Color(0xFFD946EF)),);
                    }
                  },
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<int>(
                value: 1,
                child: Text('Logout', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        ],
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF18181B), Color(0xFF09090B)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(18.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Enter Amazon product URL...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12.0),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: const Color(0xFF27272a),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                        hintStyle: const TextStyle(color: Color(0xFFa1a1aa)),
                      ),
                      style: const TextStyle(color: Colors.white),
                      onSubmitted: (_) => _searchProduct(),
                    ),
                  ),
                  const SizedBox(width: 10),
                  _isSearching
                      ? const SizedBox(
                          height: 36,
                          width: 36,
                          child: CircularProgressIndicator(strokeWidth: 3),
                        )
                      : IconButton(
                          icon: const Icon(Icons.search, color: Color(0xFFD946EF)),
                          onPressed: _searchProduct,
                          tooltip: 'Search product',
                          splashRadius: 24,
                        ),
                ],
              ),
            ),
            Expanded(
              child: FutureBuilder<Map<String, dynamic>>(
                future: recentSearches,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.redAccent)));
                  } else if (!snapshot.hasData ||
                      !snapshot.data!.containsKey('products') ||
                      (snapshot.data!['products'] as List).isEmpty) {
                    return const Center(
                      child: Text('No recent searches found', style: TextStyle(color: Color(0xFFa1a1aa))),
                    );
                  } else {
                    final products = snapshot.data!['products'] as List<dynamic>;
                    return ListView.builder(
                      itemCount: products.length,
                      itemBuilder: (context, index) {
                        final product = products[index];
                        return Dismissible(
                          key: Key(product['product_id']),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              gradient: const LinearGradient(
                                colors: [Colors.redAccent, Color(0xFF18181B)],
                                begin: Alignment.centerRight,
                                end: Alignment.centerLeft,
                              ),
                            ),
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 32),
                            child: const Icon(Icons.delete, color: Colors.white, size: 30),
                          ),
                          confirmDismiss: (direction) async {
                            return await showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  backgroundColor: const Color(0xFF18181B),
                                  title: const Text("Confirm Delete", style: TextStyle(color: Colors.white)),
                                  content: const Text("Are you sure you want to delete this product?", style: TextStyle(color: Color(0xFFa1a1aa))),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.of(context).pop(false),
                                      child: const Text("Cancel", style: TextStyle(color: Color(0xFFA5B4FC))),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.of(context).pop(true),
                                      child: const Text("Delete", style: TextStyle(color: Color(0xFFD946EF))),
                                    ),
                                  ],
                                );
                              },
                            );
                          },
                          onDismissed: (direction) {
                            _deleteProduct(product['product_id']);
                          },
                          child: Card(
                            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                            color: const Color(0xFF18181B),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => ProductDetailScreen(
                                      productId: product['product_id'],
                                    ),
                                  ),
                                );
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(14.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(
                                        product['image'] ?? '',
                                        width: 74,
                                        height: 74,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) =>
                                            Container(
                                          width: 74,
                                          height: 74,
                                          color: Colors.grey[900],
                                          child: const Icon(Icons.image, size: 38, color: Color(0xFFa1a1aa)),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            product['name'] ?? 'No name available',
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.white,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'ID: ${product['product_id']}',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Color(0xFFa1a1aa),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.chevron_right, color: Color(0xFFD946EF)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}