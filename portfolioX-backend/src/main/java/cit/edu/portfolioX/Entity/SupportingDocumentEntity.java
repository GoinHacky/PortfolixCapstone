package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;

@Entity
public class SupportingDocumentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sdID;

    private String name;
    private String fileType;

    @Lob
    private byte[] fileData;

    @ManyToOne
    @JoinColumn(name = "projectID")
    private ProjectEntity project;

    public Long getSdID() {
        return sdID;
    }

    public void setSdID(Long sdID) {
        this.sdID = sdID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public ProjectEntity getProject() {
        return project;
    }

    public void setProject(ProjectEntity project) {
        this.project = project;
    }

    // Getters and setters...
}
