package ru.itmo.beans;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;
import lombok.Getter;

@Named("startPageBean")
@RequestScoped
@SuppressWarnings("unused")
public class StartPageBean {
    @Getter
    private final String studentName = "Баукин Максим Александрович";

    @Getter
    private final String groupNumber = "P3230";

    @Getter
    private final String variantNumber = "15180462";
}