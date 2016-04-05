library("gdata")
setwd("/home/alec/Projects/Brookings/multidimensional-disadvantage/")

tot <- read.xls("data/Metro Level MDP Data FMT.xlsx", "tot", na.strings=c("N",""), skip=1, header=TRUE)[,1:13]
tot_w <- read.xls("data/Metro Level MDP Data FMT.xlsx", "tot_w", na.strings=c("N",""), skip=1, header=TRUE)
tot_b <- read.xls("data/Metro Level MDP Data FMT.xlsx", "tot_b", na.strings=c("N",""), skip=1, header=TRUE)
tot_h <- read.xls("data/Metro Level MDP Data FMT.xlsx", "tot_h", na.strings=c("N",""), skip=1, header=TRUE)

multdis <- read.xls("data/Metro Level MDP Data FMT.xlsx", "multdis", na.strings=c("N",""), skip=1, header=TRUE)
multdis_w <- read.xls("data/Metro Level MDP Data FMT.xlsx", "multdis_w", na.strings=c("N",""), skip=1, header=TRUE)
multdis_b <- read.xls("data/Metro Level MDP Data FMT.xlsx", "multdis_b", na.strings=c("N",""), skip=1, header=TRUE)
multdis_h <- read.xls("data/Metro Level MDP Data FMT.xlsx", "multdis_h", na.strings=c("N",""), skip=1, header=TRUE)

identical(names(multdis), names(multdis_w)) && identical(names(multdis_w), names(multdis_b)) && identical(names(multdis_b), names(multdis_h))
identical(names(tot), names(tot_w)) && identical(names(tot_w), names(tot_b)) && identical(names(tot_b), names(tot_h))

nm1 <- c("CBSA", "Metro", "AdultPop", "LowInc", "ConcPov", "LimitEd", "NoInsure", "NonWorking", 
                                      "LowIncSh", "ConcPovSh", "LimitEdSh", "NoInsureSh", "NonWorkingSh")
nm2 <- c("CBSA", "Metro", "AdultPop", "LI_CP", "LI_LE", "LI_HI", "LI_NW", "LI_2P", 
                                      "LI_CP_SH", "LI_LE_SH", "LI_HI_SH", "LI_NW_SH", "LI_2P_SH")

for(i in 1:length(names(tot))){
  cat(nm1[i])
  cat("==")
  cat(names(tot)[i])
  cat("\n")
}

for(i in 1:length(names(multdis))){
  cat(nm2[i])
  cat("==")
  cat(names(multdis)[i])
  cat("\n")
}

names(tot) <- nm1
names(tot_w) <- nm1
names(tot_b) <- nm1
names(tot_h) <- nm1

names(multdis) <- nm2
names(multdis_w) <- nm2
names(multdis_b) <- nm2
names(multdis_h) <- nm2

tot$Race <- "All"
tot_w$Race <- "White"
tot_b$Race <- "Black"
tot_h$Race <- "Hispanic"

multdis$Race <- "All"
multdis_w$Race <- "White"
multdis_b$Race <- "Black"
multdis_h$Race <- "Hispanic"

TOT <- rbind(tot, tot_w, tot_b, tot_h)
MUL <- rbind(multdis, multdis_w, multdis_b, multdis_h)

TOT[is.na(TOT$CBSA), "CBSA"] <- 88888
MUL[is.na(MUL$CBSA), "CBSA"] <- 88888
