package ru.itmo.beans;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Named
@RequestScoped
public class TimeBean {
    public String getServerTime() {
        return Instant.now().atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}