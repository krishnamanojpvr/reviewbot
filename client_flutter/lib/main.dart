import 'package:flutter/material.dart';
import 'package:client_flutter/screens/auth/login_screen.dart';
import 'package:client_flutter/screens/auth/register_screen.dart';
import 'package:client_flutter/screens/dashboard_screen.dart';
import 'package:client_flutter/utils/shared_prefs.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  static const Color _fuchsia = Color(0xFFD946EF); // Tailwind fuchsia-400
  static const Color _indigo = Color(0xFFA5B4FC); // Tailwind indigo-200

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Product Review Dashboard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF09090B), // gray-950
        primaryColor: _fuchsia,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _fuchsia,
          brightness: Brightness.dark,
          primary: _fuchsia,
          secondary: _indigo,
          surface: const Color(0xFF18181B), // gray-900
          onPrimary: Colors.white,
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(color: Colors.white),
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Color(0xFFa1a1aa)), // gray-400
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF18181B), // gray-900
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF27272a), // gray-800
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF3f3f46)), // gray-700
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _fuchsia, width: 2),
          ),
          labelStyle: const TextStyle(color: Colors.white70),
          hintStyle: const TextStyle(color: Color(0xFFa1a1aa)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ButtonStyle(
            backgroundColor: WidgetStateProperty.all(_fuchsia),
            foregroundColor: WidgetStateProperty.all(Colors.white),
            padding: WidgetStateProperty.all(const EdgeInsets.symmetric(vertical: 14, horizontal: 30)),
            shape: WidgetStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            textStyle: WidgetStateProperty.all(const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF18181B),
          elevation: 3,
          margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        snackBarTheme: const SnackBarThemeData(
          backgroundColor: Color(0xFF18181B),
          contentTextStyle: TextStyle(color: Colors.white),
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: _fuchsia,
        ),
        iconTheme: const IconThemeData(color: _fuchsia),
        popupMenuTheme: const PopupMenuThemeData(
          color: Color(0xFF18181B),
          textStyle: TextStyle(color: Colors.white),
        ),
      ),
      home: FutureBuilder<String?>(
        future: SharedPrefs.getToken(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          } else {
            return snapshot.hasData ? const DashboardScreen() : const LoginScreen();
          }
        },
      ),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/register': (context) => const RegisterScreen(),
      },
    );
  }
}