class Product {
  final String productId;
  final String url;
  final String name;
  final String image;
  final String price;
  final String rating;
  final List<String> about;
  final ReviewSummary summaryDetails;
  final SentimentDetails sentimentDetails;

  Product({
    required this.productId,
    required this.url,
    required this.name,
    required this.image,
    required this.price,
    required this.rating,
    required this.about,
    required this.summaryDetails,
    required this.sentimentDetails,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      productId: json['product_id'],
      url: json['url'],
      name: json['product_details']['name'],
      image: json['product_details']['image'],
      price: json['product_details']['price'],
      rating: json['product_details']['rating'],
      about: List<String>.from(json['product_details']['about']),
      summaryDetails: ReviewSummary.fromJson(json['summary_details']),
      sentimentDetails: SentimentDetails.fromJson(json['sentiment_details']),
    );
  }
}

class ReviewSummary {
  final int reviewCount;
  final String summaryText;
  final int wordCount;

  ReviewSummary({
    required this.reviewCount,
    required this.summaryText,
    required this.wordCount,
  });

  factory ReviewSummary.fromJson(Map<String, dynamic> json) {
    return ReviewSummary(
      reviewCount: json['review_count'],
      summaryText: json['summary_text'],
      wordCount: json['word_count'],
    );
  }
}

class SentimentDetails {
  final double avgScore;
  final int negative;
  final int neutral;
  final int positive;
  final List<double> scores;

  SentimentDetails({
    required this.avgScore,
    required this.negative,
    required this.neutral,
    required this.positive,
    required this.scores,
  });

  factory SentimentDetails.fromJson(Map<String, dynamic> json) {
    return SentimentDetails(
      avgScore: json['avg_score'].toDouble(),
      negative: json['negative'],
      neutral: json['neutral'],
      positive: json['positive'],
      scores: List<double>.from(json['scores']),
    );
  }

  int get total => negative + neutral + positive;
}