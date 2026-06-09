import 'package:flutter/material.dart';

class MessageInput extends StatefulWidget {
  final Function(String) onSend;

  const MessageInput({super.key, required this.onSend});

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  final TextEditingController _controller = TextEditingController();
  bool _isTyping = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(top: BorderSide(color: Colors.grey.shade300)),
      ),
      child: Row(
        children: [
          IconButton(icon: const Icon(Icons.attach_file), onPressed: () {}),
          IconButton(icon: const Icon(Icons.photo_camera), onPressed: () {}),
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey.shade100,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
              ),
              onChanged: (text) {
                setState(() {
                  _isTyping = text.isNotEmpty;
                });
              },
              onSubmitted: (text) {
                if (text.trim().isNotEmpty) {
                  widget.onSend(text.trim());
                  _controller.clear();
                  setState(() {
                    _isTyping = false;
                  });
                }
              },
            ),
          ),
          const SizedBox(width: 8),
          if (_isTyping)
            CircleAvatar(
              backgroundColor: Theme.of(context).primaryColor,
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white),
                onPressed: () {
                  if (_controller.text.trim().isNotEmpty) {
                    widget.onSend(_controller.text.trim());
                    _controller.clear();
                    setState(() {
                      _isTyping = false;
                    });
                  }
                },
              ),
            )
          else
            IconButton(icon: const Icon(Icons.mic), onPressed: () {}),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
