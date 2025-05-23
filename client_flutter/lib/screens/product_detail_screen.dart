import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:client_flutter/api/api_service.dart';
import 'package:client_flutter/models/product.dart';
import 'package:client_flutter/utils/shared_prefs.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  ProductDetailScreenState createState() => ProductDetailScreenState();
}

class ProductDetailScreenState extends State<ProductDetailScreen> {
  Future<Product>? productDetails;
  final ApiService apiService = ApiService();
  String? token;
  final TextEditingController _queryController = TextEditingController();
  final ScrollController _chatScrollController = ScrollController();
  List<ChatMessage> chatMessages = [];
  bool _isSendingQuery = false;

  @override
  void initState() {
    super.initState();
    _loadToken();
  }

  @override
  void dispose() {
    _queryController.dispose();
    _chatScrollController.dispose();
    super.dispose();
  }

  Future<void> _loadToken() async {
    token = await SharedPrefs.getToken();
    setState(() {
      productDetails = apiService
          .getProductDetails(widget.productId, token!)
          .then((json) => Product.fromJson(json));
    });
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $url';
    }
  }

  Future<void> _sendQuery() async {
    if (_queryController.text.isEmpty) return;

    final query = _queryController.text;
    setState(() {
      chatMessages.add(ChatMessage(text: query, isUser: true));
      _queryController.clear();
      _isSendingQuery = true;
    });

    Future.delayed(const Duration(milliseconds: 100), () {
      if (_chatScrollController.hasClients) {
        _chatScrollController.animateTo(
          _chatScrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOut,
        );
      }
    });

    try {
      final response = await apiService.sendQuery(
        productId: widget.productId,
        query: query,
        token: token!,
      );

      setState(() {
        chatMessages.add(ChatMessage(text: response, isUser: false));
      });

      Future.delayed(const Duration(milliseconds: 100), () {
        if (_chatScrollController.hasClients) {
          _chatScrollController.animateTo(
            _chatScrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeOut,
          );
        }
      });
    } catch (e) {
      setState(() {
        chatMessages.add(ChatMessage(
          text: 'Error: Failed to get response. Please try again.',
          isUser: false,
        ));
      });
    } finally {
      setState(() {
        _isSendingQuery = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
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
            Expanded(
              child: FutureBuilder<Product>(
                future: productDetails,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(
                        child: Text('Error: ${snapshot.error}',
                            style: const TextStyle(color: Colors.redAccent)));
                  } else if (!snapshot.hasData) {
                    return const Center(
                        child: Text('No product details found',
                            style: TextStyle(color: Color(0xFFa1a1aa))));
                  } else {
                    final product = snapshot.data!;
                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(18.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.network(
                                product.image,
                                height: isMobile ? 180 : 220,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) =>
                                    Container(
                                  width: 120,
                                  height: 120,
                                  color: Colors.grey[900],
                                  child: const Icon(Icons.image,
                                      size: 50, color: Color(0xFFa1a1aa)),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            product.name,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  color: const Color(0xFFD946EF),
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Text(
                                product.price,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(width: 16),
                              const Icon(Icons.star,
                                  color: Colors.amber, size: 20),
                              Text(product.rating,
                                  style: const TextStyle(fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFD946EF),
                              side: const BorderSide(
                                  color: Color(0xFFD946EF), width: 2),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 10),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.open_in_new),
                            label: const Text('View on Amazon'),
                            onPressed: () => _launchURL(product.url),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'About this product',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFD946EF)),
                          ),
                          const SizedBox(height: 8),
                          ...product.about.map((item) => Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 4.0),
                                child: Text(
                                  '• $item',
                                  style:
                                      const TextStyle(color: Color(0xFFa1a1aa)),
                                ),
                              )),
                          const SizedBox(height: 24),
                          const Text(
                            'Review Summary',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFD946EF)),
                          ),
                          const SizedBox(height: 8),
                          Text(product.summaryDetails.summaryText,
                              style: const TextStyle(color: Colors.white)),
                          const SizedBox(height: 8),
                          Text(
                            '${product.summaryDetails.wordCount} words from ${product.summaryDetails.reviewCount} reviews',
                            style: const TextStyle(
                                color: Color(0xFFa1a1aa), fontSize: 13),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'Sentiment Analysis',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFD946EF)),
                          ),
                          const SizedBox(height: 8),
                          _buildSentimentProgressBar(
                              'Positive',
                              product.sentimentDetails.positive,
                              product.sentimentDetails.total,
                              Colors.green),
                          _buildSentimentProgressBar(
                              'Neutral',
                              product.sentimentDetails.neutral,
                              product.sentimentDetails.total,
                              Colors.yellow[600]!),
                          _buildSentimentProgressBar(
                              'Negative',
                              product.sentimentDetails.negative,
                              product.sentimentDetails.total,
                              Colors.redAccent),
                          const SizedBox(height: 8),
                          Text(
                            'Average score: ${product.sentimentDetails.avgScore.toStringAsFixed(2)}',
                            style: const TextStyle(color: Color(0xFFa1a1aa)),
                          ),
                          const SizedBox(height: 30),
                          const Text(
                            'Ask about this product',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFD946EF)),
                          ),
                          const SizedBox(height: 8),
                          _buildChatMessages(isMobile: isMobile),
                        ],
                      ),
                    );
                  }
                },
              ),
            ),
            _buildChatInput(),
          ],
        ),
      ),
    );
  }

  Widget _buildChatMessages({bool isMobile = false}) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: isMobile ? 200 : 320,
        minHeight: 80,
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Scrollbar(
        controller: _chatScrollController,
        radius: const Radius.circular(16),
        thickness: 4,
        thumbVisibility: true,
        child: ListView.builder(
          controller: _chatScrollController,
          shrinkWrap: true,
          itemCount: chatMessages.length,
          itemBuilder: (context, index) {
            final message = chatMessages[index];
            return Align(
              alignment:
                  message.isUser ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                margin:
                    const EdgeInsets.symmetric(vertical: 4.0, horizontal: 6),
                padding: const EdgeInsets.all(10.0),
                decoration: BoxDecoration(
                  color: message.isUser
                      ? const Color(0xFFD946EF).withOpacity(0.9)
                      : const Color(0xFF27272a),
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: message.isUser
                        ? const Radius.circular(16)
                        : const Radius.circular(6),
                    bottomRight: message.isUser
                        ? const Radius.circular(6)
                        : const Radius.circular(16),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!message.isUser)
                      const Icon(Icons.smart_toy,
                          color: Color(0xFFA5B4FC), size: 20),
                    if (!message.isUser) const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        message.text,
                        style: TextStyle(
                          color: message.isUser ? Colors.white : Colors.white,
                          fontWeight: message.isUser
                              ? FontWeight.w500
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                    if (message.isUser) const SizedBox(width: 4),
                    if (message.isUser)
                      const Icon(Icons.person,
                          color: Color(0xFFD946EF), size: 20),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildChatInput() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6),
        decoration: const BoxDecoration(
          color: Color(0xFF18181B),
          border: Border(top: BorderSide(color: Color(0xFF3f3f46))),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _queryController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Ask a question about this product...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: Color(0xFFa1a1aa)),
                  contentPadding:
                      EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                ),
                onSubmitted: (_) => _sendQuery(),
              ),
            ),
            IconButton(
              icon: _isSendingQuery
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.send, color: Color(0xFFD946EF)),
              onPressed: _isSendingQuery ? null : _sendQuery,
              splashRadius: 24,
              tooltip: 'Send',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSentimentProgressBar(
      String label, int value, int total, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$label: $value/$total',
              style: const TextStyle(color: Color(0xFFa1a1aa))),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: total > 0 ? value / total : 0,
            backgroundColor: color.withOpacity(0.23),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
          ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;

  ChatMessage({required this.text, required this.isUser});
}
