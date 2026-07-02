# CISC архитектура(m68k)
> *Вариант:* rle_compress_bytes


### Условие:

```python
def rle_compress_bytes(*input_words):
    """Run-length compression for bytes packed in 32-bit words.

    Input format:
    - First word: length of data in bytes
    - Following words: data bytes packed in words (4 bytes per word)
    - If byte count not divisible by 4, pad with zeros

    Output format:
    - First word: length of compressed data in bytes
    - Following words: compressed data as count+byte pairs

    Example: [4, 0x0A0A0A0A] -> [2, 0x040A0000] (4 bytes of 0x0A -> count=4, byte=0x0A)
    """
    if not input_words:
        return [-1]

    length = input_words[0]
    if length < 0:
        return [-1]

    if length == 0:
        return [0]

    try:
        # Extract bytes from words
        bytes_data = []
        word_count = (length + 3) // 4  # Round up to nearest word

        for i in range(1, min(len(input_words), word_count + 1)):
            word = input_words[i]
            for j in range(4):
                if len(bytes_data) < length:
                    byte_val = (word >> (24 - j * 8)) & 0xFF
                    bytes_data.append(byte_val)

        if len(bytes_data) < length:
            return [-1]  # Not enough input data

        # Compress bytes
        compressed = []
        i = 0
        while i < len(bytes_data):
            current_byte = bytes_data[i]
            count = 1

            # Count consecutive identical bytes
            while (
                i + count < len(bytes_data)
                and bytes_data[i + count] == current_byte
                and count < 255
            ):
                count += 1

            compressed.append(count)
            compressed.append(current_byte)
            i += count

        # Pack compressed data into words
        result = [len(compressed)]  # Length in bytes

        for i in range(0, len(compressed), 4):
            word = 0
            for j in range(4):
                if i + j < len(compressed):
                    word |= (compressed[i + j] & 0xFF) << (24 - j * 8)
            result.append(word)

        return result

    except Exception:
        return [-1]


assert rle_compress_bytes(4, 168430090) == [2, 67764224]
assert rle_compress_bytes(12, 2863315899, 3435973836, 3722304989) == [8, 44696251, 80479453]
assert rle_compress_bytes(1, 4278190080) == [2, 33488896]
```



