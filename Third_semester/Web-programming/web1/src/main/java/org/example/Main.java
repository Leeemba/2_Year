package org.example;

import com.fastcgi.FCGIInterface;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;

public class Main {
    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        Check checker = new Check();
        Validation validator = new Validation();

        while (fcgi.FCGIaccept() >= 0) {
            try {
                if (FCGIInterface.request == null) {
                    respond400("request is null");
                    continue;
                }

                String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD", "");
                if (!"POST".equalsIgnoreCase(method)) {
                    respond405();
                    continue;
                }

                long startTime = System.nanoTime();

                int contentLength = Integer.parseInt(
                        FCGIInterface.request.params.getProperty("CONTENT_LENGTH", "0")
                );
                String body = readExactly(System.in, contentLength);

                String contentType = FCGIInterface.request.params.getProperty("CONTENT_TYPE", "");
                if (!(contentType != null && contentType.toLowerCase().startsWith("application/x-www-form-urlencoded") && !body.isEmpty())) {
                    respond400("You broke something again: content-type or body. Don't mess with HTTP requests!");
                    continue;
                }
                LinkedHashMap<String, String> values = parseBody(contentType, body);
                if (!values.containsKey("x") || !values.containsKey("y") || !values.containsKey("r")) {
                    respond400("Missing x/y/r parameters in the request body or something is wrong with it");
                    continue;
                }


                float x;
                float y;
                int r;
                try {
                    x = Float.parseFloat(values.get("x"));
                    String yy = values.get("y");
                    yy = yy.replace(",", ".");
                    y = Float.parseFloat(yy);
                    r = Integer.parseInt(values.get("r"));
                } catch (Exception e) {
                    respond400("Incorrect data format. Why are you bypassing the system?");
                    continue;
                }

                if (!validator.validate(x, y, r)) {
                    respond400("Data validation error. Why are you bypassing the system?");
                    continue;
                }

                boolean hit = checker.getAnswer(x, y, r);

                String content = """
                        {"result":"%s","x":"%s","y":"%s","r":"%s","time":"%s","workTime":"%s"}
                        """.formatted(
                        hit, x, y, r,
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                        (double) (System.nanoTime() - startTime) / 1000000
                );

                writeResponse(content);

            } catch (Exception e) {
                respond500(e.getMessage());
            }
        }
    }

    private static String readExactly(InputStream in, int n) throws IOException {
        byte[] buf = new byte[n];
        int off = 0;
        while (off < n) {
            int read = in.read(buf, off, n - off);
            if (read < 0) break;
            off += read;
        }
        return new String(buf, 0, off, StandardCharsets.UTF_8);
    }

    private static LinkedHashMap<String, String> parseBody(String ct, String body) {
        LinkedHashMap<String, String> map = new LinkedHashMap<>();
        for (String p : body.split("&")) {
            String[] kv = p.split("=", 2);
            if (kv.length == 2) {
                String k = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
                String v = URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
                map.put(k, v);
            }
        }

        return map;
    }

    private static void respond405() {
        writeJson("Status: 405 Method Not Allowed",
                "{\"error\":\"Method not allowed. Use POST.\"}");
    }

    private static void respond400(String msg) {
        writeJson("Status: 400 Bad Request",
                "{\"error\":\"" + safe(msg) + "\"}");
    }

    private static void respond500(String msg) {
        writeJson("Status: 500 Internal Server Error",
                "{\"error\":\"" + safe(msg) + "\"}");
    }

    private static void writeResponse(String content) {
        writeJson("Status: 200 OK", content);
    }

    private static void writeJson(String statusLine, String json) {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        System.out.println(statusLine);
        System.out.println("Content-Type: application/json; charset=utf-8");
        System.out.println("Content-Length: " + bytes.length);
        System.out.println();
        System.out.write(bytes, 0, bytes.length);
        System.out.flush();
    }

    private static String safe(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}