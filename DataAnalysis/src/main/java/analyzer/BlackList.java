package analyzer;
import java.io.BufferedWriter;
//import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;

public class BlackList {
    private static String BLACKLIST_FILE = "./doc/blacklist";
    private HashSet<String> blacklistSet;

    /**
     * Use a customized file as input blacklist file to create blacklist.
     * @param file the path of the input file.
     */
    public BlackList(String file) {
        BLACKLIST_FILE = file;
        blacklistSet = new HashSet<>();
        Scanner scanner = null;
        
        try {
            scanner = new Scanner(new File(file), "UTF-8");
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                blacklistSet.add(line.trim());
            }
        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
            if (scanner != null) scanner.close();
        }
    }

    /**
     * Use default blacklist file to create blacklist.
     */
    public BlackList() {
        this(BLACKLIST_FILE);
    }
    
    /**
     * Use this function to get the current blacklist.
     * @return current blacklist
     */
    public HashSet<String> showBlacklist() {
        return blacklistSet;
    }
    
    /**
     * Add new people to blacklist.
     * Require the last line of original file is a newline without any character.
     * @param list Twitter ID of people to add to blacklist 
     */
    public void addToBlacklist(List<String> list) {
        if (list == null || list.size() == 0) return;
        BufferedWriter bw = null;
        try {
            bw = new BufferedWriter(new FileWriter(BLACKLIST_FILE, true));
            for (String s : list) {
                if (blacklistSet.contains(s))
                    continue;
                blacklistSet.add(s);
                bw.write(s);
                bw.newLine();
            }
            bw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (bw != null)
                try {
                    bw.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
    }
    
    /**
     * Add a person to blacklist.
     * @param name Twitter ID of the person to add.
     */
    public void addToBlacklist(String name) {
        List<String> list = new ArrayList<>();
        list.add(name);
        this.addToBlacklist(list);
    }

    /**
     * Check whether followers of a given person exist in blacklist.
     * @param list A list of Twitter ID of a given person's followers.
     * @return A list of followers in blacklist.
     */
    public List<String> checkFriends(List<String> list) {
        List<String> res = new ArrayList<>();
        for (String s : list) {
            if (blacklistSet.contains(s)) {
                res.add(s);
            }
        }
        return res;
    }
}